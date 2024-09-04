import React from 'react';
import pearLogo from '../../assets/pearlogo.png';
import Cart from '../../assets/shoppingcart.svg';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
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

  const location = useLocation();
  const currentPage = location.pathname;

  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const departmentParam = searchParams.get('department') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortbyParam = searchParams.get('sortby') || 'new';
  const itemQueryParam = searchParams.get('item') || '';
  const departmentArray = departmentParam ? departmentParam.split(',') : [];
  const categoryArray = categoryParam ? categoryParam.split(',') : [];

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
      <div className=" lg:mb-0 h-16 bg-green-300 items-center w-full flex">
        <div className="flex items-center ml-4 sm:ml-6 md:ml-12 lg:ml-24 min-w-max">
          <Link to="/" className="text-black text-2xl">
            <div className="space-x-2 items-center flex">
              <h2 className="text-black text-3xl italic cursor-pointer bg-green-300">
                MSAID
              </h2>
              <img
                src={pearLogo}
                alt="logo"
                className="h-8 w-8 transform rotate-12"
              />
            </div>
          </Link>
        </div>
        <div className="flex items-center  ml-2 h-full">
          <Link
            to="/shop"
            className={`h-full px-5 text-2xl items-center flex ${currentPage === '/shop' ? 'bg-green-200' : 'text-black'}`}
          >
            <h2>Shop</h2>
          </Link>
          <Link
            to="/generate"
            className={`h-full px-5 text-2xl items-center flex ${currentPage === '/generate' ? 'bg-green-200' : 'text-black'}`}
          >
            <h2>Generate</h2>
          </Link>
        </div>
        <div className="relative flex items-center max-w-[1000px] w-full ml-4">
          <BiSearchAlt className="absolute right-4 text-gray-500 text-xl" />
          <input
            className="w-full py-2 pr-10 pl-4 border-2 border-gray-300 focus:border-green-500 focus:outline-none transition duration-200 rounded-2xl"
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
        <div className="flex items-center justify-end mx-6 space-x-8 min-w-max">
          {user ? (
            <div className="space-x-2 items-center flex">
              <Skeleton className="w-8 h-8 rounded-full animate-none" />
              <h2>{user}</h2>
            </div>
          ) : (
            <Link to="/login" className="flex items-center">
              <h2>Login</h2>
            </Link>
          )}
          <Link to="/cart" className="flex items-center">
            <img
              src={Cart}
              href="/cart"
              alt="Cart"
              className="h-10 w-10 hover:cursor-pointer"
            />
          </Link>
        </div>{' '}
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
              className={`xl:text-sm font-medium ${departmentArray.includes(department) ? 'text-green-500 hover:text-black' : 'text-black hover:text-green-500'} `}
              onClick={() => handleClick(department)}
            >
              {department}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
