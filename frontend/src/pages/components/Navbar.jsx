import React from 'react';
import pearLogo from '../../assets/pearlogo.png';
import Cart from '../../assets/cart.png';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const handleClick = Department => {
    navigate('/shop?&department=' + Department);
    // onChange();
    console.log('Department:', Department);
  };
  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/verifyjwt', {
        withCredentials: true,
      });
      setUser(response.data);
      console.log('User:', response.data);
    } catch (error) {
      console.error(
        'Error fetching user:',
        error.response ? error.response.data : error.message
      );
    }
  };

  // useEffect(() => {
  //   fetchUser();
  // });
  return (
    <div>
      <div className="mb-10 lg:mb-0 h-16 bg-green-300 flex items-center w-full">
        <div className="flex items-center ml-4">
          <img src={pearLogo} alt="logo" className="h-10 w-10" />
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
        {user ? (
          <h2>user.name</h2>
        ) : (
          <Link to="/login" className="flex items-center mr-4">
            <h2>Login</h2>
          </Link>
        )}
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
      <div className="hidden lg:block">
        <div className="flex items-center border-b-2 border-slate-200  bg-green-200 h-10 w-full mb-10 justify-evenly">
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Electronics')}
          >
            Electronics
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Clothing and Accessories')}
          >
            Clothing and Accessories
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Home and Garden')}
          >
            Home and Garden
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Health and Beauty')}
          >
            Health and Beauty
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Toys and Games')}
          >
            Toys and Games
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Sports and Outdoors')}
          >
            Sports and Outdoors
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Automotive')}
          >
            Automotive
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Office Supplies')}
          >
            Office Supplies
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Books and Media')}
          >
            Books and Media
          </h3>
          <h3
            className="text-l p-4 hover:cursor-pointer"
            onClick={() => handleClick('Crafts and Hobbies')}
          >
            Crafts and Hobbies
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
