import React from 'react';
import pearLogo from '../../assets/pearlogo.png';
import Cart from '../../assets/shoppingcart.svg';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BiSearchAlt } from 'react-icons/bi';
import { Skeleton } from '@/components/ui/skeleton';

const Navbar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [searchItem, setSearchItem] = useState('');

  const handleClick = Department => {
    navigate(`/shop?department=${Department}`);
  };

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/user', {
        withCredentials: true,
      });
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error(
        'Error fetching user:',
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSearch = searchitem => {
    window.scrollTo(0, 0);
    navigate(`/shop?item=${searchitem}`);
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <div>
      <div className=" lg:mb-0 h-16 bg-green-300 flex items-center w-full">
        <div className="flex items-center ml-4">
          <img src={pearLogo} alt="logo" className="h-10 w-10" />
        </div>
        <div className="flex items-center flex-grow justify-center">
          <Link to="/" className=" text-black text-2xl p-5 ">
            <h2>Home</h2>
          </Link>
          <Link to="/shop" className=" text-black text-2xl p-5 ">
            <h2>Shop</h2>
          </Link>
          <Link to="/about" className=" text-black text-2xl p-5 ">
            <h2>About</h2>
          </Link>
          <Link to="/generate" className=" text-black text-2xl p-5 ">
            <h2>Generate</h2>
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center mr-4">
            <h2> </h2>
          </div>
        ) : user ? (
          <div className="flex space-x-2 items-center mr-4">
            <Skeleton className="w-8 h-8 rounded-full animate-none" />
            <h2>{user}</h2>
          </div>
        ) : (
          <Link to="/login" className="flex items-center mr-4">
            <h2>Login</h2>
          </Link>
        )}{' '}
        <Link to="/cart" className="flex items-center mr-4">
          <div className="flex items-center mr-4">
            <img
              src={Cart}
              href="/cart"
              alt="Cart"
              className="h-10 w-10 ml-4 hover:cursor-pointer"
            />
          </div>
        </Link>
      </div>

      <div className="bg-green-200 w-full py-3 px-8 flex flex-wrap items-center justify-center">
        <div className="hidden lg:flex flex-wrap justify-center items-center xl:space-x-4 space-x-8">
          {[
            'Electronics',
            'Clothing and Accessories',
            'Home and Garden',
            'Health and Beauty',
            'Toys and Games',
            'Sports and Outdoors',
            'Automotive',
            'Office Supplies',
            'Books and Media',
            'Crafts and Hobbies',
          ].map(department => (
            <button
              key={department}
              className="text-black hover:text-green-500 transition duration-300 xl:text-sm font-medium"
              onClick={() => handleClick(department)}
            >
              {department}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-end bg-green-100">
        <div className="relative flex items-center max-w-sm">
          <BiSearchAlt className="absolute left-3 text-gray-500 text-xl" />
          <input
            className="w-full py-2 pl-10 pr-4 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none transition duration-200"
            type="text"
            placeholder="Search all items"
            onChange={event => setSearchItem(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                handleSearch(searchItem);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
