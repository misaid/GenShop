import mongoose from "mongoose";

// Categories within a department
const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      // unique: true,
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  }
);

// Department which has categories
const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categories: [categorySchema],
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model("Department", departmentSchema);
export default Department;
