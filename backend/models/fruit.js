import mongoose from "mongoose";

const fruiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Fruit = mongoose.model("Fruit", fruiteSchema);
export default Fruit;
