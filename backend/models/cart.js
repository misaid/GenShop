import mongoose from "mongoose";

// TODO: make sure that the user variables cart item is the a mongoose objecid
const cartSchema = new mongoose.Schema({
  cartItem: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
