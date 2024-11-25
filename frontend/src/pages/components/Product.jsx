// External imports
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

// Internal imports
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import { StaticStar } from '@/pages/components';
import { Button } from '@/components/ui/button';

/**
 * Product component used in the procuctpage componoenet
 * @param {object} product - Product object
 * @returns {JSX.Element}
 */
export default function Product({ product }) {
  const { name, averageRating, countInStock, price, image, _id } = product;
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();
  const { cartCount, setCartCount } = useCart();
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const productClicked = () => {
    console.log('product clicked', _id);
    navigate(`/product/${_id}`);
  };

  const addToCart = async () => {
    try {
      const response = await axiosInstance.post(
        `/cart`,
        {
          flag: 'add',
          productId: _id,
          quantity: 1,
        },
        {
          withCredentials: true,
        }
      );
      setCartCount(prevCartCount => prevCartCount + 1);
      toast.success('1 ' + name + ' added to cart');
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        toast.error('Please login to add to cart');
        return;
      }
      toast.error('Error adding to cart');
      console.error(
        'Error adding to cart:',
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="h-[300px] mobile:h-[400px] plg:h-[450px] w-[188px] mobile:w-[250px] plg:w-[275px] border border-b-gray rounded-xl overflow-hidden bg-white shadow-md">
      <Toaster />

      <div className="px-3 flex flex-col">
        <div className="flex flex-col items-center">
          <div className="">
            {!imageLoading && (
              <Skeleton className="w-[188px] mobile:w-[250px] plg:w-[275px] h-[188px] mobile:h-[250px] plg:h-[275px] rounded-t-xl m-0 absolute" />
            )}
            <div className="w-[188px] mobile:w-[250px] plg:w-[275px] h-[188px] mobile:h-[250px] plg:h-[275px] rounded-t-xl ">
              <Link to={`/product/${_id}`}>
                <img
                  className="hover:cursor-pointer object-cover"
                  src={image}
                  alt="product"
                  onLoad={() => setImageLoading(true)}
                  style={imageLoading ? {} : { display: 'none' }}
                />
              </Link>
            </div>
          </div>
        </div>

        {!name ? (
          <Skeleton className="w-24 h-5 mb-1 mt-2 rounded-xl" />
        ) : (
          <div className="h-5 my-1">
            <StaticStar urate={averageRating} size={15} />
          </div>
        )}

        <div className="flex flex-col flex-grow">
          <Link to={`/product/${_id}`}>
            <h2 className="font-bold text-md mobile:text-xl hover:cursor-pointer truncate">
              {!price ? (
                <Skeleton className="w-1/4 h-4 mobile:h-5 my-1 rounded-xl" />
              ) : (
                <NumericFormat
                  value={price}
                  displayType={'text'}
                  thousandSeparator=","
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale
                />
              )}
            </h2>
          </Link>

          {!name ? (
            <Skeleton className="w-1/2 h-4 mobile:h-6 rounded-xl mobile:mb-2 " />
          ) : (
            <h3 className="font-semibold text-sm mobile:text-l h-6 mobile:mb-3 hover:text-slate-600 hover:cursor-pointer inline-block truncate">
              <Link to={`/product/${_id}`}>{name}</Link>
            </h3>
          )}

          {!countInStock ? (
            <Skeleton className="w-1/4 h-4 hidden plg:block rounded-xl" />
          ) : (
            <h4 className="text-xs font-thin hidden  plg:block">
              Stock left: {countInStock}
            </h4>
          )}
        </div>
        {!name ? (
          <div className="flex justify-center items-center w-full my-2 hover:cursor-pointer select-none">
            <Skeleton className="w-full mobile:h-8 h-6  rounded-xl" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center">
            <Button
              variant="outline"
              className="flex justify-center items-center w-full rounded-2xl mobile:my-2 h-7 mobile:h-10 hover:shadow-lg transition-all duration-200 select-none"
              onClick={() => addToCart()}
            >
              <ShoppingCart className="w-4 h-4 mr-2 text-gray-700 mobile:w-5 moblie:h-5 " />
              <span className="text-sm font-medium">Add to Cart</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
