import React from "react";
import pearLogo from "../../assets/pearlogo.png";
import Cart from "../../assets/cart.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="h-24 border-b-2 border-slate-200 bg-green-300 flex items-center">
      <div className="flex items-center ml-4">
        <img src={pearLogo} alt="logo" className="h-16 w-16" />
      </div>
      <div className="flex items-center flex-grow justify-center">
        <Link to="/" className=" text-black text-2xl p-5 mx-3">
          <h2>Home</h2>
        </Link>
        <Link to="/shop" className=" text-black text-2xl p-5 mx-3">
          <h2>Shop</h2>
        </Link>
        <Link to="/about" className=" text-black text-2xl p-5 mx-3">
          <h2>About</h2>
        </Link>
        <Link to="/generate" className=" text-black text-2xl p-5 mx-3">
          <h2>Generate</h2>
        </Link>
      </div>
      <Link to="/login" className="flex items-center mr-4">
        <h2>Login</h2>
      </Link>
      <Link to="/cart" className="flex items-center mr-4">
        <div className="flex items-center mr-4">
          <img
            src={Cart}
            href="/cart"
            alt="Cart"
            className="h-16 w-16 ml-4 hover:cursor-pointer"
          />
        </div>
      </Link>
    </div>
  );
};

export default Navbar;
