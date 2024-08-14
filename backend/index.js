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
// models
import User from './models/user.js';
import Cart from './models/cart.js';
import Comment from './models/comment.js';
import Order from './models/order.js';
import Product from './models/product.js';
import Department from './models/department.js';
import verifyJWT from './middleware/verifyJWT.js';
// env variables
dotenv.config();
const PORT = process.env.PORT || 5001;
const mongoDBURL = process.env.mongoDBURL;
const secretKey = process.env.secretKey;
const DOMAIN = process.env.domain || 'http://localhost:5001';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

var limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 400, // max 100 requests per windowMs
});

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(limiter);
app.use(express.json());

app.get('/', (request, response) => {
  console.log(request);
  return response.status(234).send('MSAID');
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
 */
app.post('/generate', async (request, response) => {
  //console.log(request.body.prompt);

  try {
    // const promptInstructions =
    //   "You are an assistant that does nothing but respond to the prompt with a json object with variables price (float), description (100 words), stock(int), categories(string array with subarrays capitalization like a title) in format [department:[major categories:[subcategories]], and name(string) for a potential product. With no additional description or context";
    const promptInstructions = `
    You are an assistant tasked with generating a JSON object that contains the following fields for a potential product:

    - price (float): The cost of the product.
    - description (string, 100 words): A concise summary of the product.
    - stock (integer): The number of units available.
    - department: The department that the product belongs to. Title capitalization. Department name cannot exist in categories.
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

    // Create an image from variable name
    const imageInstruction =
      'You are an assistant that does nothing but respond to the prompt with an image of the product based on the name the image must only contain a single item and be a product image with a white background this is the product name: ';
    const imagePrompt = imageInstruction + name;
    const imageCompletion = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });
    const imageB64 = imageCompletion.data[0].b64_json;

    console.log('Image of:', name, '\nGenerated');

    const imageBuffer = Buffer.from(imageB64, 'base64');
    const fileName = `${uuidv4()}.png`;
    const params = {
      Bucket: 'moprojects',
      Key: `Eprj/${fileName}`,
      Body: imageBuffer,
      ContentEncoding: 'base64',
      ContentType: 'image/png',
      CacheControl: 'max-age=31536000',
    };

    // Upload the image to S3
    const uploadResult = await s3.putObject(params).promise();
    // console.log('Successfully uploaded image to S3:', uploadResult);

    // S3 image URL
    const image_url = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

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
      { new: true, upsert: true } // Ensure the department is created if it doesn't exist
    ).exec();

    for (const categoryName of categories) {
      let category = departmentDoc.categories.find(
        cat => cat.categoryName === categoryName
      );

      if (category) {
        await Department.updateOne(
          { _id: departmentDoc._id, 'categories.categoryName': categoryName },
          { $addToSet: { 'categories.$.products': product._id } }
        );
      } else {
        await Department.updateOne(
          { _id: departmentDoc._id },
          {
            $addToSet: {
              categories: { categoryName, products: [product._id] },
            },
          }
        );
      }
    }
    await departmentDoc.save();

    console.log('Product created:', product._id);
    return response.status(200).send({ item: variables, image: image_url });
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in generating response');
  }
});

/**
 * Get products depending on the page
 * @param {int} page
 * @return {json} products
 * @return {int } totalPages
 */
app.get('/products', async (request, response) => {
  try {
    const pageid = request.query.page;
    // console.log(pageid);
    // not the most ideal way to calculate total pages
    // could use a running total in the database
    const totalProducts = await Product.countDocuments();
    // Checking if the page is valid
    if ((pageid - 1) * 10 > Math.ceil(totalProducts)) {
      console.error('Invalid page number');
      return response.status(400).send('Invalid page number');
    }
    const products = await Product.find()
      .skip((pageid - 1) * 10)
      .limit(10);
    const totalPages = Math.ceil(totalProducts / 10);
    return response.status(200).json({ products, totalPages });
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
    // console.log(product._id);
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
    console.log(request.user);
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
        console.log('Adding item to cart');
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
    if (flag === 'remove') {
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
    return response.status(200);
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
    console.log(request.user);
    const userID = request.user.userId;
    const user = await User.findById(userID);
    const cartID = user.cartid;
    const cart = await Cart.findById(cartID);
    return response.status(200).json(cart);
  } catch (error) {
    console.log(error);
    return response.status(400).send('Error in fetching cart');
  }
});

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.clear();
    console.log(
      '\n***************************************************\n' +
        'Time is ' +
        new Date() +
        '\nApp is connected to database'
    );
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch(error => {
    console.log(error);
  });
