import mongoose from 'mongoose';
// Category model
const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
  }
);

// Department model
const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
      unique: true,
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model('Category', categorySchema);
export const Department = mongoose.model('Department', departmentSchema);
export default { Category, Department };
