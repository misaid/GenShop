import express from 'express';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import cors from 'cors';

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});