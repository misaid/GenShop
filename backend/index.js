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
// models
import User from './models/user.js';
import Cart from './models/cart.js';
import Comment from './models/comment.js';
import Order from './models/order.js';
import Product from './models/product.js';
import { Category, Department } from './models/department.js';
import verifyJWT from './middleware/verifyJWT.js';
// env variables
dotenv.config();
const PORT = process.env.PORT || 5001;
const mongoDBURL = process.env.mongoDBURL;
const secretKey = process.env.secretKey;
const DOMAIN = process.env.domain || 'http://localhost:5001';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);
const stripekey = process.env.STRIPE_SECRET_KEY;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// var limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 400, // max 100 requests per windowMs
// });
const stripeapi = new stripe(stripekey);
const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
// app.use(limiter);
app.use(express.json());

app.get('/', (request, response) => {
  console.log(request);
  return response.status(234).send('MSAID');
});

app.get('/verifyjwt', verifyJWT, (request, response) => {
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

// TODO: make username case insensitive
/**
 * Register a user
 * @param {string} username
 * @param {string} password
 * @return {string} token
 */
app.post('/register', async (request, response) => {
  //console.log(request.body);
  const { username, password } = request.body;
  console.log(username, password);
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
    const token = jwt.sign({ userId: user._id }, secretKey);
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
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
    const token = jwt.sign({ userId: user._id }, secretKey);
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return response.status(200).send('User logged in');
  } catch (error) {
    consle.log(error);
  }
});

/**
 * Log out the user
 */
app.post('/logout', async (request, response) => {
  response.clearCookie('token');
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
    // console.log('one request');
    const pageid = request.body.page;
    const category = request.body.category;
    const department = request.body.department;
    const sortType = request.body.sortType;
    const item = request.body.item;

    const ipr = 12;
    // console.log('change');
    // console.log('item: ', item);
    let sortCondition = {};
    switch (sortType) {
      case 'priceDesc':
        sortCondition = { price: -1 };
        break;
      case 'priceAsc':
        sortCondition = { price: 1 };
        break;
      case 'ratingDesc':
        sortCondition = { rating: -1 };
        break;
      case 'ratingAsc':
        sortCondition = { rating: 1 };
        break;
      case 'new':
      default:
        sortCondition = { createdAt: -1 };
    }

    if (item) {
      try {
        const totalProducts = await Product.countDocuments({
          name: { $regex: item, $options: 'i' },
        });

        if ((pageid - 1) * ipr >= totalProducts) {
          console.error('Invalid page number');
          return response.status(400).send('Invalid page number');
        }

        const products = await Product.find({
          name: { $regex: item, $options: 'i' },
        })
          .sort(sortCondition) // sort by newest
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
      const totalProducts = await Product.countDocuments();
      // Checking if the page is valid
      if ((pageid - 1) * ipr > Math.ceil(totalProducts)) {
        console.error('Invalid page number');
        return response.status(400).send('Invalid page number');
      }
      const products = await Product.find()
        .sort(sortCondition) // sort by newest
        .skip((pageid - 1) * ipr)
        .limit(ipr);
      const totalPages = Math.ceil(totalProducts / ipr);
      return response.status(200).json({ products, totalPages, totalProducts });
    } else {
      // console.log('Department:', department);
      // console.log('Category:', category);
      const departmentDoc = await Department.findOne({
        departmentName: department,
      });
      const productsInDepartment = await Product.find({
        _id: { $in: departmentDoc.products },
      });
      // Department and no categories
      if (category.length < 1) {
        const totalProducts = productsInDepartment.length;

        const products = await Product.find({
          _id: { $in: departmentDoc.products },
        })
          .sort(sortCondition) // sort by newest
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
        // Obtain all matching cateogries from department
        const categoryDocs = await Category.find({
          _id: { $in: departmentDoc.categories },
          categoryName: { $in: category },
        });

        // Obtain all product ids
        const allProductIds = categoryDocs.map(category => category.products);

        // Find the intersection of all product IDs arrays
        const commonProductIds = allProductIds.reduce((a, b) =>
          a.filter(c => b.includes(c))
        );

        const totalProducts = commonProductIds.length;
        if ((pageid - 1) * ipr >= totalProducts) {
          console.error('Invalid page number');
          return response.status(400).send('Invalid page number');
        }

        // Find all products that are in the categories from the department
        const productsInCategories = await Product.find({
          _id: { $in: commonProductIds },
        })
          .sort(sortCondition) // sort by newest
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
    const user = await User.findById(userID);
    const cartID = user.cartid;

    let { productId, quantity, flag } = request.body;
    quantity = parseInt(quantity, 10);

    const cart = await Cart.findById(cartID);
    const product = await Product.findById(productId);
    const stock = product.countInStock;

    if (flag === 'add') {
      const cartItem = cart.cartItem.find(
        item => item.productId.toString() === productId
      );
      if (cartItem) {
        if (cartItem.quantity + quantity <= stock) {
          cartItem.quantity += quantity;
        } else {
          return response.status(400).send('Not enough stock');
        }
      } else {
        if (quantity <= stock) {
          cart.cartItem.push({ productId, quantity });
        } else {
          return response.status(400).send('Not enough stock');
        }
      }
    }
    if (flag === 'set') {
      const cartItem = cart.cartItem.find(
        item => item.productId.toString() === productId
      );
      if (cartItem) {
        cartItem.quantity = quantity;
      } else {
        return response.status(400).send('Item not in cart');
      }
    }
    if (flag === 'delete') {
      const cartItem = cart.cartItem.find(
        item => item.productId.toString() === productId
      );
      if (cartItem) {
        cart.cartItem = cart.cartItem.filter(
          item => item.productId.toString() !== productId
        );
      } else {
        return response.status(400).send('Item not in cart');
      }
    }

    await cart.save();
    return response.status(200).send('cart has been changed');
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in adding item to cart');
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
            unit_amount: Number(item.price.toFixed(2)) * 100,
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
      success_url: `http://localhost:5001/success_url?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5001/failure_url`,
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

app.get('/success_url', verifyJWT, async (request, response) => {
  try {
    const checkoutSessionId = request.query.session_id;

    const session = await stripeapi.checkout.sessions.retrieve(
      checkoutSessionId,
      {
        expand: ['line_items'],
      }
    );

    console.log(session.payment_intent);
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

    console.log('Payment Info:', paymentInfo);

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
        console.log(cartItem, items[i].quantity);
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
        status: 'paid',
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
    return response.redirect('http://localhost:5173/orders');
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in payment');
  }
});

app.get('/failure_url', (request, response) => {
  try {
    return response.redirect('http://localhost:5173/cart');
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in payment');
  }
});

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
      .skip((pageid - 1) * ipr)
      .limit(ipr);

    const totalPages = Math.ceil(totalOrders / ipr);
    //completed orders items orders {  order {
    // product {product, quantity}
    // order {order}
    //}}

    const fullOrder = [];
    for (let i = 0; i < orders.length; i++) {
      const productPromises = orders[i].orderItems.map(item =>
        Product.findById(item.productId)
      );

      const products = await Promise.all(productPromises);

      const orderWithProducts = {
        ...orders[i],
        products: products,
      };

      fullOrder.push(orderWithProducts);
    }

    return response.status(200).json({ fullOrder, totalPages, totalOrders });
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in fetching orders');
  }
});

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.clear();
    let date = new Date();
    let hours = date.getHours() % 12;
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    console.log(
      '\n*****************************************\n' +
        'Time is ' +
        hours +
        ':' +
        minutes +
        ':' +
        seconds +
        '\nApp is connected to database'
    );
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch(error => {
    console.log(error);
  });
