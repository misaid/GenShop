import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
// models
import User from "./models/user.js";
import Cart from "./models/cart.js";
import Comment from "./models/comment.js";
import Order from "./models/order.js";
import Product from "./models/product.js";
import Category from "./models/category.js";

dotenv.config();
const PORT = process.env.PORT || 5001;
const mongoDBURL = process.env.mongoDBURL;
const secretKey = process.env.secretKey;
const DOMAIN = process.env.domain || "http://localhost:5001";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);

var limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 400, // max 100 requests per windowMs
});

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(limiter);
app.use(express.json());

app.get("/", (request, response) => {
  console.log(request);
  return response.status(234).send("MSAID");
});

// TODO: make username case insensitive
/**
* Register a user
* @param {string} username
* @param {string} password
* @return {string} token
*/
app.post("/register", async (request, response) => {
  //console.log(request.body);
  const { username, password } = request.body;
  console.log(username, password);
  if (!username || !password) {
    return response.status(400).send("Usename and password are required");
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
    response.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return response.status(201).send("User created");
  } catch (error) {
    console.log(error);
    return response.status(409).send("Username already exists");
  }
});
/**
* login user
* @param {string} username
* @param {string} password
* @return {jsonwebtoken} token
*/
app.post("/login", async (request, response) => {
  try {
    if (!request.body.username || !request.body.password) {
      return response.status(400).send("Username and password are required)");
    }
    const { username, password } = request.body;
    const lower_username = username.toLowerCase();
    const user = await User.findOne({ username: lower_username });
    if (!user) {
      return response.status(400).send("Invalid username or password");
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return response.status(400).send("Invalid username or password");
    }
    const token = jwt.sign({ userId: user._id }, secretKey);
    response.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return response.status(200).send("User logged in");
  } catch (error) {
    consle.log(error);
  }
});

/**
 * Log out the user
 */
app.post("/logout", async (request, response) => {
  response.clearCookie("token");
  return response.status(200).send("User logged out");
});

/**
 * Genereate an item based on the users prompt
* @param {string} prompt
* @return {json} item
* @return {string} image
 */
app.post("/generate", async (request, response) => {
  //console.log(request.body.prompt);
  try {
    const promptInstructions =
      "You are an assistant that does nothing but respond to the prompt with a json object with variables price (float), description (100 words), stock(int), categories(string array capitalization like a title) and name for a potential product. With no additional description or context";
    const chatContent = promptInstructions + request.body.prompt;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: chatContent }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    });
    //convert varibles to json
    const variables = JSON.parse(completion.choices[0].message.content);
    const name = variables.name;
    const price = variables.price;
    const description = variables.description;
    const stock = variables.stock;
    const categories = variables.categories;
    console.log(variables);
    // create an image from variable name
    const imageInstruction =
      "You are an assistant that does nothing but respond to the prompt with an image of the product based on the name the image must only contain a single item and be a product image with a white background this is the product name: ";
    const imagePrompt = imageInstruction + name;
    const imageCompletion = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    const image_url = imageCompletion.data[0].b64_json;
    //create product
    const categories_db = await Category.find({}, "categoryName");
    console.log(categories);
    const new_product = {
      name: name,
      price: price,
      image: image_url,
      countInStock: stock,
      description: description,
    };
    const product = await Product.create(new_product);
    // create category if it does not exist and add product to that cateogry
    for (let i = 0; i < categories.length; i++) {
      const category = categories_db.find(
        (category) => category.categoryName === categories[i],
      );
      //TODO: this is broken because for some reason we cannot push to category.products
      if (category) {
        console.log(category);
        category.products.push(product._id);
        await category.save();
      } else {
        const new_category = await Category.create({
          categoryName: categories[i],
          products: [product._id],
        });
      }
    }
    return response
      .status(200)
      .send({ item: completion.choices[0].message.content, image: image_url });
  } catch (error) {
    console.log(error);
    return response.status(400).send("Error in generating response");
  }
});

/**
  * Get products depending on the page
  * @param {int} page
  * @return {json} products
  * @return {int } totalPages
  */
app.get("/products", async (request, response) => {
  try {
    const pageid = request.query.page;
    console.log(pageid);
    // not the most ideal way to calculate total pages
    // could use a running total in the database
    const totalProducts = await Product.countDocuments();
    // Checking if the page is valid
    if ((pageid - 1) * 10 > Math.ceil(totalProducts)) {
      console.error("Invalid page number");
      return response.status(400).send("Invalid page number");
    }
    const products = await Product.find()
      .skip((pageid - 1) * 10)
      .limit(10);
    const totalPages = Math.ceil(totalProducts / 10);
    return response.status(200).json({ products, totalPages });
  } catch (error) {
    console.log(error);
    return response.status(400).send("Error in fetching products");
  }
});
app.get("/product/:id", async (request, response) => {
  try {
    const productId = request.params.id;
    const product = await Product.findById(productId);
    console.log(product._id);
    return response.status(200).json(product);
  } catch (error) {
    console.log(error);
    return response.status(400).send("Error in fetching product");
  }
});
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("\n\n\n\n\n\n\n\n\n\n" + "Time is " + new Date() + "\nApp is connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
