import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
// models
import User from './models/user';
dotenv.config();
const PORT = process.env.PORT || 5000;
const mongoDBURL = process.env.mongoDBURL;
const secretKey = process.env.secretKey;
const DOMAIN = process.env.domain || 'http://localhost:5001';

var limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 400, // max 100 requests per windowMs
  });

const app = express();
app.use(cors({origin:"http://localhost:5173", credentials: true}));
app.use(cookieParser());
app.use(limiter);
app.use(express.json());



app.get("/", (request, response) => {
    console.log(request);
    return response.status(234).send("MSAID");
  });


app.post("/register", async (request, response) => {
  console.log(request.body);
  const { username, password } = request.body;
  if (!username || !password) {
    return response.status(400).send("Usename and password are required");
  }
  try {
    const user = await User.create({username, password });
    const token = jwt.sign({ userId: user._id }, secretKey);
    response.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return response.status(201).send("User created");
  }
  catch (error) {
  console.log(error);
  return response.status(500).send("Username already exists");
  }
  });

app.post("/login", async (request, response) => {
  try {
    console.log(request.body);
  } catch (error) {
    consle.log(error);
    }
  });


mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("Time is " + new Date() + "\nApp is connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
