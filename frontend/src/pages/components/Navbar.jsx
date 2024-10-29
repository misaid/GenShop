// External imports
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from 'react-router-dom';
import { BiSearchAlt } from 'react-icons/bi';
import { Search, ShoppingBag, Wand2, ShoppingCart, User } from 'lucide-react';

// Internal imports
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import pearLogo from '../../assets/pearlogo.png';
import Cart from '../../assets/shoppingcart.svg';

/**
 * The navbar component
 * @returns { JSX.Element } - The navbar component
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, setCartCount } = useCart();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [searchItem, setSearchItem] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleClick = Department => {
    navigate(`/shop?department=${Department}`);
  };

  const location = useLocation();
  const currentPage = location.pathname;

  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const departmentParam = searchParams.get('department') || '';
  const categoryParam = searchParams.get('category') || '';

  function totalItems(cartInfo) {
    let total = 0;
    for (let i = 0; i < cartInfo.length; i++) {
      total += cartInfo[i].quantity;
    }
    setCartCount(total);
  }

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/cart', {
        withCredentials: true,
      });

      totalItems(response.data.cartInfo);
    } catch (error) {
      console.log("Couldn't fetch cart");
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/user', {
        withCredentials: true,
      });
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.log("Couldn't fetch user");
    }
  };

  const handleSearch = searchItem => {
    console.log(searchItem);
    window.scrollTo(0, 0);
    navigate(`/shop?item=${searchItem}`);
  };

  async function handleLogout() {
    try {
      await axiosInstance.post('/logout', {}, { withCredentials: true });
      window.location.href = '/';
    } catch (error) {
      console.log("Couldn't fetch user");
    }
  }

  useEffect(() => {
    fetchCart();
    fetchUser();
  }, [departmentParam, location]);

  const departments = [
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
  ];

  return (
    <nav className="w-full">
      <div className="mx-auto w-full border-b">
        <div className="flex items-center justify-between py-4 border-b px-4">
          <Link to="/" className="text-2xl font-bold italic">
            MSAID
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/shop" className="flex items-center space-x-1">
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Shop</span>
            </Link>
            <Link to="/generate" className="flex items-center space-x-1">
              <Wand2 className="w-5 h-5" />
              <span className="hidden sm:inline">Generate</span>
            </Link>
            <form
              onSubmit={event => {
                event.preventDefault();
                handleSearch(searchItem);
              }}
              className="relative hidden md:block"
            >
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-[200px] lg:w-[300px]"
                value={searchItem}
                onChange={e => setSearchItem(e.target.value)}
              />
            </form>

            {user ? (
              <Link to={'/cart'}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 ? (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-2.5">
                      {cartCount}
                    </Badge>
                  ) : null}

                  <span className="sr-only">Cart</span>
                </Button>
              </Link>
            ) : (
              <Link to={'/login'}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 ? (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-2.5">
                      {cartCount}
                    </Badge>
                  ) : null}

                  <span className="sr-only">Cart</span>
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <Link to="/myaccount">
                      <DropdownMenuItem>
                        <div className="hover:cursor-pointer w-full h-full">
                          My Account
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    <div className="hover:cursor-pointer">
                      <Link to="/orders">
                        <DropdownMenuItem>
                          <div className="hover:cursor-pointer w-full h-full">
                            Orders
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    </div>

                    <DropdownMenuItem>
                      <div
                        className="hover:cursor-pointer w-full h-full"
                        onClick={() => handleLogout()}
                      >
                        Logout
                      </div>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <Link to="/login">
                    <DropdownMenuItem>Login</DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="w-full">
          <form
            onSubmit={event => {
              event.preventDefault();
              handleSearch(searchItem);
            }}
            className="relative block md:hidden"
          >
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-full text-base"
              value={searchItem}
              onChange={e => setSearchItem(e.target.value)}
            />
          </form>
        </div>
        <div className="py-2 overflow-x-auto hidden md:block">
          <ul className="flex space-x-4 justify-center whitespace-nowrap">
            {departments.map((department, index) => (
              <li key={index}>
                <Link to={`/shop?department=${department}`}>
                  <Button variant="ghost" className="text-sm">
                    {department}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
