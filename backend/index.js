import express from 'express';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
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
app.use(cors({origin: DOMAIN, credentials: true}));
app.use(cookieParser());
app.use(limiter);


app.get("/", (request, response) => {
    console.log(request);
    return response.status(234).send("MSAID");
  });


app.post("/register", async (request, response) => {

  });

app.post("/login", async (request, response) => {

  });
    


mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
