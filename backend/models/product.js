import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
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
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "categorySchema" },
    ],
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("productSchema", productSchema);
export default Product;
