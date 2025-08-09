// External imports
import sharp from 'sharp';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import stripe from 'stripe';
import mongoSanitize from 'express-mongo-sanitize';

// Internal imports
import {
  User,
  Cart,
  Comment,
  Order,
  Product,
  Category,
  Department,
} from './models/index.js';
import verifyJWT from './middleware/verifyJWT.js';

// Environment variables
dotenv.config();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const SECRET_KEY = process.env.SECRET_KEY; // avoid using this in handlers during tests
const DOMAIN = process.env.DOMAIN || process.env.domain || 'http://localhost:5001';
const SHOP_URL = process.env.SHOP_URL || 'http://localhost:5173';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const stripekey = process.env.STRIPE_SECRET_KEY;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 400, // max 100 requests per windowMs
// });
const stripeapi = new stripe(stripekey);
export const app = express();

app.use(
  cors({
    origin: [
      SHOP_URL,
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://frontend:3000',
    ],
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(cookieParser());
// app.use(limiter);
app.use(express.json());

app.get('/', (request, response) => {
  return response.status(234).send('MSAID');
});

/**
 * Verify the user and return the user
 * @return {json} user
 */
app.post('/verifyjwt', verifyJWT, (request, response) => {
  try {
    return response.status(200).json(request.user);
  } catch (error) {
    console.log(error);
  }
});

/**
 * get the user
 * @return {string} username
 */
app.get('/user', verifyJWT, async (request, response) => {
  try {
    const user = await User.findById(request.user.userId);
    return response.status(200).json(user.username);
  } catch (error) {
    console.log(error);
  }
});

/**
 * Register a user
 * @param {string} username
 * @param {string} password
 * @return {string} token
 */
app.post('/register', async (request, response) => {
  //console.log(request.body);
  const { username, password } = request.body;
  if (!username || !password) {
    return response.status(400).send('Usename and password are required');
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const lower_username = username.toLowerCase();
    //create references to cart
    const new_cart = await Cart.create({});
    const new_user = {
      username: lower_username,
      password: password_hash,
      cartid: new_cart._id,
    };
    const user = await User.create(new_user);
    //console.log(user);
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'test',
      sameSite: process.env.NODE_ENV !== 'test' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return response.status(201).send('User created');
  } catch (error) {
    console.log(error);
    return response.status(409).send('Username already exists');
  }
});

/**
 * login user
 * @param {string} username
 * @param {string} password
 * @return {jsonwebtoken} token
 */
app.post('/login', async (request, response) => {
  try {
    if (!request.body.username || !request.body.password) {
      return response.status(400).send('Username and password are required)');
    }
    const { username, password } = request.body;
    const lower_username = username.toLowerCase();
    const user = await User.findOne({ username: lower_username });
    if (!user) {
      return response.status(400).send('Invalid username or password');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return response.status(400).send('Invalid username or password');
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'test',
      sameSite: process.env.NODE_ENV !== 'test' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return response.status(200).send('User logged in');
  } catch (error) {
    console.log(error);
  }
});

/**
 * Log out the user
 */
app.post('/logout', async (request, response) => {
  response.clearCookie('jwt');
  return response.status(200).send('User logged out');
});

/**
 * Genereate an item based on the users prompt
 * @param {string} prompt
 * @return {json} item
 * @return {string} image
 * @return {json} product
 */
app.post('/generate', async (request, response) => {
  //console.log(request.body.prompt);

  try {
    // const promptInstructions =
    //   "You are an assistant that does nothing but respond to the prompt with a json object with variables price (float), description (100 words), stock(int), categories(string array with subarrays capitalization like a title) in format [department:[major categories:[subcategories]], and name(string) for a potential product. With no additional description or context";
    const promptInstructions = `
    You are an assistant tasked with generating a JSON object that contains the following fields for a potential product:

    - price (float value): The cost of the product.
    - description (string, 100 words): A concise summary of the product.
    - stock (integer): The number of units available.
    - department: The department that the product belongs to. Department name cannot exist in categories. Department name must absolutely be one of "Electronics", "Clothing and Accessories", "Home and Garden", "Health and Beauty", "Toys and Games", "Sports and Outdoors", "Automotive", "Office Supplies", "Books and Media", "Crafts and Hobbies".
    - categories (array): The categories that the product belongs to. Title capitalization.
    - name (string): The name of the product.

    Your response should be strictly in JSON format, with no additional text or explanation.
    `;

    const chatContent = promptInstructions + request.body.prompt;
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: chatContent }],
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
    });
    console.log('Prompt:', request.body.prompt, '\nComplete');

    // Convert varibles to json
    const variables = JSON.parse(completion.choices[0].message.content);
    const { name, price, description, stock, categories, department } =
      variables;

    //cap price
    //if test comment from here
    // Create an image from variable name
    console.log('Image of:', name, 'Generating');
    const imageInstruction =
      'You are an assistant that does nothing but respond to the prompt with an image of the product based on the name the image must only contain a single item and be a product image with a white background this is the product name: ';
    const imagePrompt =
      imageInstruction + 'name: ' + name + 'desctiption: ' + description;
    const imageCompletion = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });
    const imageB64 = imageCompletion.data[0].b64_json;
    console.log('Image generated');

    const imageBuffer = Buffer.from(imageB64, 'base64');

    // if too computationally intensive comment this
    async function webpimage(buffer) {
      try {
        const webpImage = await sharp(buffer)
          .resize(512, 512)
          .toFormat('webp')
          .toBuffer();
        return webpImage;
      } catch (error) {
        console.log(error);
      }
    }

    const webpImage = await webpimage(imageBuffer);
    const fileName = `${uuidv4()}.webp`;
    const params = {
      Bucket: 'moprojects',
      Key: `Eprj/${fileName}`,
      Body: webpImage,
      ContentEncoding: 'base64',
      ContentType: 'image/webp', // Corrected to 'image/webp'
      CacheControl: 'max-age=31536000',
    };

    // Upload the image to S3
    const uploadResult = await s3.putObject(params).promise();
    console.log('Successfully uploaded image to S3:', uploadResult);
    //to here

    // S3 image URL
    const image_url = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    // if testing unccomment this
    // const image_url =
    //   'https://moprojects.s3.us-east-2.amazonaws.com/Eprj/arch-black-4k.png';

    // Create Product
    const new_product = {
      name: name,
      price: price,
      image: image_url,
      countInStock: stock,
      description: description,
      department: department,
      categories: categories,
      flag: 'unmoderated',
    };
    const product = await Product.create(new_product);

    // If department exists add product to department and check if sub categoiries exits and if they do append product to it.
    let departmentDoc = await Department.findOneAndUpdate(
      { departmentName: department },
      { $addToSet: { products: product._id } },
      { new: true, upsert: true }
    ).exec();

    for (const categoryName of categories) {
      let category = await Category.findOneAndUpdate(
        { categoryName: categoryName, department: departmentDoc._id },
        {
          $addToSet: { products: product._id },
          $set: { department: departmentDoc._id },
        },
        { new: true, upsert: true }
      ).exec();

      await Department.updateOne(
        { _id: departmentDoc._id },
        { $addToSet: { categories: category._id } }
      );
    }

    console.log('Product created:', product._id);
    return response
      .status(200)
      .send({ item: variables, image: image_url, product: product });
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in generating response');
  }
});

/**
 * Get products depending on the parameters
 * @param {int} page - The page number for pagination
 * @param {string} category - The category of the products
 * @param {string} department - The department of the products
 * @param {string} sortType - The type of sorting applied
 * @return {json} products - The products retrieved
 * @return {int} totalPages - The total number of pages
 * @return {int} len - The number of products in each category
 */
app.post('/products', async (request, response) => {
  try {
    const pageid = request.body.page;
    const category = request.body.category;
    const department = request.body.department;
    const sortType = request.body.sortType;
    const item = request.body.item;

    const ipr = 12;

    let baseCondition = {
      $or: [{ flag: { $exists: false } }, { flag: 'moderated' }],
    };

    let sortCondition = {};
    switch (sortType) {
      case 'priceDesc':
        sortCondition = { price: -1 };
        break;
      case 'priceAsc':
        sortCondition = { price: 1 };
        break;
      case 'ratingDesc':
        sortCondition = { averageRating: -1 };
        break;
      case 'ratingAsc':
        sortCondition = { averageRating: 1 };
        break;
      case 'new':
      default:
        sortCondition = { createdAt: -1 };
    }

    if (item) {
      try {
        const totalProducts = await Product.countDocuments({
          ...baseCondition,
          name: { $regex: item, $options: 'i' },
        });

        if ((pageid - 1) * ipr >= totalProducts) {
          console.error('Invalid page number');
          return response.status(400).send('Invalid page number');
        }

        const products = await Product.find({
          ...baseCondition,
          name: { $regex: item, $options: 'i' },
        })
          .sort(sortCondition)
          .skip((pageid - 1) * ipr)
          .limit(ipr);

        const totalPages = Math.ceil(totalProducts / ipr);

        return response
          .status(200)
          .json({ products, totalPages, totalProducts });
      } catch (error) {
        return response.status(400).send('Error in fetching products');
      }
    }

    if (department.length > 1) {
      return response.status(400).send('Only one department allowed');
    }

    if (category.length == 0 && department.length == 0) {
      const totalProducts = await Product.countDocuments(baseCondition);
      if ((pageid - 1) * ipr > Math.ceil(totalProducts)) {
        console.error('Invalid page number');
        return response.status(400).send('Invalid page number');
      }
      const products = await Product.find(baseCondition)
        .sort(sortCondition)
        .skip((pageid - 1) * ipr)
        .limit(ipr);
      const totalPages = Math.ceil(totalProducts / ipr);
      return response.status(200).json({ products, totalPages, totalProducts });
    } else {
      const departmentDoc = await Department.findOne({
        departmentName: department,
      });
      const productsInDepartment = await Product.find({
        ...baseCondition,
        _id: { $in: departmentDoc.products },
      });

      if (category.length < 1) {
        const totalProducts = productsInDepartment.length;

        const products = await Product.find({
          ...baseCondition,
          _id: { $in: departmentDoc.products },
        })
          .sort(sortCondition)
          .skip((pageid - 1) * ipr)
          .limit(ipr);

        if ((pageid - 1) * ipr > Math.ceil(totalProducts)) {
          console.error('Invalid page number');
          return response.status(400).send('Invalid page number');
        }
        const totalPages = Math.ceil(totalProducts / ipr);
        return response
          .status(200)
          .json({ products, totalPages, totalProducts });
      } else {
        const categoryDocs = await Category.find({
          _id: { $in: departmentDoc.categories },
          categoryName: { $in: category },
        });

        const allProductIds = categoryDocs.map(category => category.products);

        const commonProductIds = allProductIds.reduce((a, b) =>
          a.filter(c => b.includes(c))
        );

        const totalProducts = commonProductIds.length;
        if ((pageid - 1) * ipr >= totalProducts) {
          console.error('Invalid page number');
          return response.status(400).send('Invalid page number');
        }

        const productsInCategories = await Product.find({
          ...baseCondition,
          _id: { $in: commonProductIds },
        })
          .sort(sortCondition)
          .skip((pageid - 1) * ipr)
          .limit(ipr);

        const totalPages = Math.ceil(totalProducts / ipr);

        return response
          .status(200)
          .send({ products: productsInCategories, totalPages, totalProducts });
      }
    }
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in fetching products');
  }
});

/**
 * Get products
 * @return {json} products
 */
app.get('/product/:id', async (request, response) => {
  try {
    const productId = request.params.id;
    const product = await Product.findById(productId);
    // capionsole.log(product._id);
    return response.status(200).json(product);
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in fetching product');
  }
});

/**
 * Add item to cart
 * @param {string} productId
 * @param {int} quantity
 * @param {string} flag
 *@return None
 */
app.post('/cart', verifyJWT, async (request, response) => {
  try {
    const userID = request.user.userId;
    const { productId, quantity: qty, flag } = request.body;
    const quantity = parseInt(qty, 10);

    // Fetch user and product in parallel
    const [user, product] = await Promise.all([
      User.findById(userID).select('cartid'),
      Product.findById(productId).select('countInStock'),
    ]);

    if (!user) {
      return response.status(400).send('User not found');
    }

    if (!product) {
      return response.status(400).send('Product not found');
    }

    const cartID = user.cartid;
    const stock = product.countInStock;

    let update;
    let options = { new: true, runValidators: true };

    if (flag === 'add') {
      update = {
        $inc: {
          'cartItem.$[elem].quantity': quantity,
        },
      };
      options.arrayFilters = [{ 'elem.productId': productId }];
    } else if (flag === 'set') {
      update = {
        $set: {
          'cartItem.$[elem].quantity': quantity,
        },
      };
      options.arrayFilters = [{ 'elem.productId': productId }];
    } else if (flag === 'delete') {
      update = {
        $pull: {
          cartItem: { productId: productId },
        },
      };
    } else {
      return response.status(400).send('Invalid flag');
    }

    let updatedCart = await Cart.findOneAndUpdate(
      { _id: cartID, 'cartItem.productId': productId },
      update,
      options
    );

    if (!updatedCart && flag === 'add') {
      // If the item doesn't exist in the cart, add it
      updatedCart = await Cart.findByIdAndUpdate(
        cartID,
        {
          $push: {
            cartItem: { productId, quantity },
          },
        },
        { new: true, runValidators: true }
      );
    } else if (!updatedCart) {
      return response.status(400).send('Item not in cart');
    }

    // Check stock after update
    const updatedItem = updatedCart.cartItem.find(
      item => item.productId.toString() === productId
    );

    if (updatedItem && updatedItem.quantity > stock) {
      // If the quantity exceeds stock, set it to the maximum available
      updatedCart = await Cart.findOneAndUpdate(
        { _id: cartID, 'cartItem.productId': productId },
        { $set: { 'cartItem.$.quantity': stock } },
        { new: true, runValidators: true }
      );
      return response
        .status(200)
        .send('Cart updated to maximum available stock');
    }

    return response.status(200).send('Cart has been changed');
  } catch (error) {
    console.log(error);
    return response.status(500).send('Error in modifying cart');
  }
});

/**
 * Get cart
 * @return {json} cart
 */
app.get('/cart', verifyJWT, async (request, response) => {
  try {
    // console.log(request.user);
    // find user
    const userID = request.user.userId;
    const user = await User.findById(userID);
    //find users cart
    const cartID = user.cartid;
    const cart = await Cart.findById(cartID);
    // find all products in cart
    const cartItems = cart.cartItem;

    const products = await Product.find({
      _id: { $in: cartItems.map(item => item.productId) },
    });
    // fore each matching product cart item add the quantity from cart to object
    const cartInfo = products.map(product => {
      const cartItem = cartItems.find(
        item => item.productId.toString() === product._id.toString()
      );
      return {
        product: product,
        quantity: cartItem.quantity,
      };
    });
    return response.status(200).json({ cart: cart, cartInfo: cartInfo });
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in fetching cart');
  }
});

/**
 * get the categories for the category component
 * @return {json} categories - The categories of the products
 * @return {int} len - The number of products in each category
 */
app.get('/categories/:id', async (request, response) => {
  try {
    const department = request.params.id;

    const departmentDoc = await Department.findOne({
      departmentName: department,
    });

    const categoryDocs = await Category.find({
      _id: { $in: departmentDoc.categories },
    });

    const categoryInfo = categoryDocs.map(category => {
      return {
        categoryName: category.categoryName,
        len: category.products.length,
      };
    });

    return response.status(200).json(categoryInfo);
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in fetching categories');
  }
});

/**
 * Checkout the users cart items using stripe
 * @param {json} items
 * @return {json} session
 */
app.post('/checkout', verifyJWT, async (request, response) => {
  try {
    const items = request.body.items;

    const line_items = await Promise.all(
      items.map(async item => {
        const product = await Product.findById(item.productId);
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              images: [product.image],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      })
    );

    const metadata = items.reduce((acc, item) => {
      acc[item.productId] = item.quantity;
      return acc;
    }, {});

    const session = await stripeapi.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: DOMAIN + `/success_url?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: DOMAIN + `/failure_url`,
      metadata: {
        items: JSON.stringify(metadata),
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Specify allowed countries
      },
    });

    return response.status(200).json(session);
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in checkout');
  }
});

/**
 * checkout success
 * @return None
 * @return {string} Payment already processed
 * @return {string} Payment successful
 * @return {string} Not enough stock
 * @return {string} Cart item not found
 * @return {string} Error in payment
 */
app.get('/success_url', verifyJWT, async (request, response) => {
  try {
    const checkoutSessionId = request.query.session_id;

    const session = await stripeapi.checkout.sessions.retrieve(
      checkoutSessionId,
      {
        expand: ['line_items'],
      }
    );

    const metadata = JSON.parse(session.metadata.items);
    const items = Object.entries(metadata).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    if (metadata.processed) {
      return response.status(200).send('Payment already processed');
    }
    const shippingAddress = session.shipping_details.address;
    const { line1, city, postal_code, country } = shippingAddress;
    const paymentInfo = 4242;

    const sessionLineItems = session.line_items.data;

    let updatedProducts = [];
    try {
      const userID = request.user.userId;
      const user = await User.findById(userID);
      const cart = await Cart.findById(user.cartid);

      // Loop through the items in the cart and remover the quantity from the cart and the product

      for (let i = 0; i < items.length; i++) {
        const cartItem = cart.cartItem.find(
          item => item.productId.toString() === items[i].productId
        );
        // console.log(cartItem, items[i].quantity);
        if (cartItem && cartItem.quantity >= items[i].quantity) {
          const product = await Product.findById(items[i].productId);
          if (product.countInStock < items[i].quantity) {
            return response.status(400).send('Not enough stock');
          } else {
            product.countInStock -= items[i].quantity;
            cartItem.quantity -= items[i].quantity;
            updatedProducts.push(product);
          }
          cart.cartItem = cart.cartItem.filter(item => item.quantity !== 0);
        } else {
          return response.status(400).send('Cart item not found not enough');
        }
        // if all this is completed create an order item
      }

      // Create the order
      const count = await Order.countDocuments();
      const order = await Order.create({
        orderNumber: count + 1,
        userid: userID,
        orderItems: items,
        shippingAddress: {
          address: line1,
          city: city,
          postalCode: postal_code,
          country: country,
        },
        paymentInfo: paymentInfo,
        total: session.amount_total / 100,
        status: 'Processing',
      });

      user.orderids.push(order._id);

      await Promise.all(updatedProducts.map(product => product.save()));
      await cart.save();
      await user.save();
      await order.save();
    } catch (error) {
      console.log(error);
      return response.status(400).send('Error in payment');
    }

    metadata.processed = true;

    await stripeapi.checkout.sessions.update(checkoutSessionId, {
      metadata: {
        items: JSON.stringify(metadata),
      },
    });
    console.log('Payment successful');
    return response.redirect(SHOP_URL + '/orders');
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in payment');
  }
});

/**
 * Checkout failed
 * @return None
 */
app.get('/failure_url', (request, response) => {
  try {
    return response.redirect(SHOP_URL + '/cart');
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in payment');
  }
});

/**
 * get user orders
 * @param {int} page - The page number for pagination
 * @return {json} fullOrder - The order object combined with products
 * @return {int} totalPages - The total number of pages
 * @return {int} totalOrders - The total number of orders
 * @return {string} Invalid page number
 * @return {string} Error in fetching orders
 * @return {string} Error in fetching orders
 */
app.post('/orders', verifyJWT, async (request, response) => {
  try {
    const pageid = request.body.page;
    const ipr = 10;

    const user = await User.findById(request.user.userId);
    let totalOrders = await Order.find({
      _id: { $in: user.orderids },
    });
    totalOrders = totalOrders.length;
    if ((pageid - 1) * ipr >= totalOrders) {
      console.error('Invalid page number');
      return response.status(400).send('Invalid page number');
    }

    const orders = await Order.find({
      _id: { $in: user.orderids },
    })
      .sort({ createdAt: -1 })
      .skip((pageid - 1) * ipr)
      .limit(ipr);

    const totalPages = Math.ceil(totalOrders / ipr);

    // Collect all product IDs
    const productIds = orders.reduce((ids, order) => {
      order.orderItems.forEach(item => ids.push(item.productId));
      return ids;
    }, []);

    // Fetch all products at once
    const products = await Product.find({
      _id: { $in: productIds },
    });

    // Map products to their IDs for easy access
    const productMap = products.reduce((map, product) => {
      map[product._id] = product;
      return map;
    }, {});

    const fullOrder = orders.map(order => {
      // Replace product IDs with actual products
      const orderWithProducts = {
        ...order._doc,
        products: order.orderItems.map(item => productMap[item.productId]),
      };
      return orderWithProducts;
    });

    return response.status(200).json({ fullOrder, totalPages, totalOrders });
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in fetching orders');
  }
});

/**
 * get the rating of a product
 * @param {int} page - The page number for pagination
 * @return {json} products - The products retrieved
 * @return {int} totalPages - The total number of pages
 * @return {int} totalProducts - The total number of products
 */
app.post('/getrating', verifyJWT, async (request, response) => {
  try {
    const userId = request.user.userId;
    const user = await User.findById(userId);
    const orders = await Order.find({ userid: user._id }).sort({
      createdAt: -1,
    });

    const pageid = request.body.page;
    const ipr = 9;

    const productids = orders.flatMap(order =>
      order.orderItems.map(item => item.productId)
    );

    const totalProducts = await Product.countDocuments({
      _id: { $in: productids },
    });

    if ((pageid - 1) * ipr >= totalProducts) {
      console.error('Invalid page number');
      return response.status(400).send('Invalid page number');
    }

    const products = await Product.find({ _id: { $in: productids } })
      .skip((pageid - 1) * ipr)
      .limit(ipr);

    const totalPages = Math.ceil(totalProducts / ipr);
    return response
      .status(200)
      .json({ products, totalPages, totalProducts, userId });
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in getting rating');
  }
});

/**
 * Add a rating to a product
 * @param {string} productId
 * @param {int} rating
 * @return None
 * @return {string} Rating set
 * @return {string} Product not ever ordered
 * @return {string} Error in setting rating
 */
app.post('/addrating', verifyJWT, async (request, response) => {
  try {
    const user = await User.findById(request.user.userId);
    const productId = request.body.productId;
    const rating = request.body.rating;
    const product = await Product.findById(productId);

    const orders = await Order.find({ userid: user._id });

    // all products that the user has ever ordered
    const productids = orders.flatMap(order =>
      order.orderItems.map(item => item.productId.toString())
    );

    // If the user has never ordered the product, they can not rate it
    if (!productids.includes(productId)) {
      console.log('Product not ever ordered');
      return response.status(400).send('Product not ever ordered');
    }

    if (!product.rating) {
      product.rating = new Map();
    }
    product.rating.set(user._id.toString(), rating);

    let sum = 0;
    for (let rating of product.rating.values()) {
      sum += rating;
    }
    product.averageRating = sum / product.rating.size;
    await product.save();
    return response.status(200).send('Rating set');
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in setting rating');
  }
});

/**
 * Delete the users account
 * @param {string} password
 * @return {string} Account deleted
 * @ return {string} Invalid username or password
 */
app.post('/delete_user', verifyJWT, async (request, response) => {
  try {
    const password = request.body.password;
    const user = await User.findById(request.user.userId);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return response.status(400).send('Invalid username or password');
    }

    // Delete Cart
    await Cart.findByIdAndDelete(user.cartid);

    // Delete Rating
    const orders = await Order.find({ userid: user._id });
    // Find all products in orders
    const productids = orders.flatMap(order =>
      order.orderItems.map(item => item.productId.toString())
    );
    const products = await Product.find({ _id: { $in: productids } });

    // for all products remove rating and recalculate averageRating
    products.forEach(async product => {
      product.rating.delete(user._id.toString());
      let sum = 0;
      for (let rating of product.rating.values()) {
        sum += rating;
      }
      product.averageRating = sum / product.rating.size;
      await product.save();
    });

    // Delete Orders
    await Order.deleteMany({ userid: user._id });

    // Delete User
    await User.findByIdAndDelete(user._id);
    return response.status(200).send('Account deleted');
  } catch (error) {
    console.log(error);
    return response
      .status(400)
      .send('Error in deleting account. Check if password is correct');
  }
});

/**
 * Get all products that are unmoderated
 * @param {int} page - The page number for pagination
 * @return {json} products - The products retrieved
 * @return {string} Error in fetching products
 */
app.get('/moderate', async (request, response) => {
  try {
    const pageid = Number(request.query.page || 1);
    const ipr = 10;
    const products = await Product.find({ flag: 'unmoderated' })
      .sort({ createdAt: -1 })
      .skip((pageid - 1) * ipr)
      .limit(ipr);
    const totalProducts = await Product.countDocuments({ flag: 'unmoderated' });
    const totalPages = Math.ceil(totalProducts / ipr);
    return response.status(200).json({ products, totalPages, totalProducts });
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in fetching products');
  }
});

/**
 * Moderate a product
 * @param {string} id
 * @return {string} Product moderated
 * @return {string} Unauthorized
 * @return {string} Error in moderating product
 */
app.post('/moderate/:id', verifyJWT, async (request, response) => {
  try {
    const user = await User.findById(request.user.userId);
    if (!user.staff) {
      return response.status(401).send('Unauthorized');
    }
    const productId = request.params.id;
    await Product.findByIdAndUpdate(productId, { flag: 'moderated' });
    console.log('Product moderated');
    return response.status(200).send('Product moderated');
  } catch (error) {
    return response.status(400).send('Error in moderating product');
  }
});

/**
 * Delete a product
 * @param {string} id
 * @return {string} Product deleted
 * @return {string} Unauthorized
 * @return {string} Error in deleting product
 */
app.post('/deleteProduct/:id', verifyJWT, async (request, response) => {
  try {
    const user = await User.findById(request.user.userId);
    if (!user.staff) {
      return response.status(401).send('Unauthorized');
    }
    const productId = request.params.id;

    await Category.updateMany(
      { products: productId },
      { $pull: { products: productId } }
    );

    await Department.updateMany(
      { products: productId },
      { $pull: { products: productId } }
    );

    await Product.findByIdAndDelete(productId);

    console.log('Product deleted', productId);

    return response.status(200).send('Product deleted');
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in deleting product');
  }
});

// Only connect and start the server outside of test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      retryWrites: true,
    })
    .then(() => {
      console.clear();

      const formatTime = num => num.toString().padStart(2, '0');
      const date = new Date();
      const hours = formatTime(date.getHours() % 12 || 12);
      const minutes = formatTime(date.getMinutes());
      const seconds = formatTime(date.getSeconds());
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

      console.log(
        '\n' +
          '*'.repeat(45) +
          '\n' +
          `⏰ Time: ${hours}:${minutes}:${seconds} ${ampm}\n` +
          `🔗 Database: Connected Successfully\n` +
          `📍 URI: ${MONGO_URI.replace(/:[^:]*@/, ':****@')}\n` +
          `🌐 Host: ${mongoose.connection.host}\n` +
          `📦 Database: ${mongoose.connection.name}\n` +
          '*'.repeat(45) +
          '\n'
      );

      app.listen(PORT, () => {
        console.log(`🚀 Server running on port: ${PORT}`);
      });
    })
    .catch(error => {
      // Comprehensive error logging
      console.error('❌ Database Connection Failed');
      console.error('Error Details:');
      console.error('Name:', error.name);
      console.error('Message:', error.message);
      console.error('URI:', MONGO_URI);

      if (error.name === 'MongoNetworkError') {
        console.error('Network error. Check connection string and network.');
      }

      process.exit(1);
    });

  mongoose.connection.on('disconnected', () => {
    console.warn('🚨 Lost MongoDB connection');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔁 Reconnected to MongoDB');
  });

  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
  });
}

export default app;
