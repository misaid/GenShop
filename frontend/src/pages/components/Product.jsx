import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { NumericFormat } from 'react-number-format';
import StaticStar from './StaticStar';
import { Skeleton } from '@/components/ui/skeleton';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '@/context/CartContext';

/**
 * Product component used in the procuctpage componoenet
 * @param {string} name - Product name
 * @param {number} rating - Product
 * @param {number} stock - Product stock
 * @param {string} imageURL - Product image
 * @param {string} productId - Product id
 * @returns {JSX.Element}
 *  */
const Product = ({ product }) => {
  const { name, rating, countInStock, price, image, _id } = product;
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
      toast.success('1 ' + name + ' added to cart');
      setCartCount(cartCount + 1);
    } catch (error) {
      console.error(
        'Error adding to cart:',
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-[200px] sm:w-[225px] md:w-[250px] lg:w-[275px] border border-b-gray rounded-xl overflow-hidden bg-white">
      <Toaster
        toastOptions={{
          style: {
            background: '#ECFDF3',
            color: '#008A2E',
          },
          className: 'class',
        }}
      />

      <div className="px-3 flex flex-col">
        <div className="flex flex-col items-center">
          <div className="">
            {!imageLoading && (
              <Skeleton className="w-[200px] sm:w-[225px] md:w-[250px] lg:w-[275px] h-[200px] sm:h-[225px] md:h-[250px] lg:h-[275px] rounded-t-xl m-0 absolute" />
            )}
            <div className="  w-[200px] sm:w-[225px] md:w-[250px] lg:w-[275px] h-[200px] sm:h-[225px] md:h-[250px] lg:h-[275px] rounded-t-xl ">
              <img
                className="hover:cursor-pointer object-cover"
                src={image}
                alt="product"
                onLoad={() => setImageLoading(true)}
                style={imageLoading ? {} : { display: 'none' }}
                onClick={() => productClicked()}
              />
            </div>
          </div>
        </div>

        {!name ? (
          <Skeleton className="w-24 h-5 mb-1 mt-2 rounded-xl" />
        ) : (
          <div className="my-1">
            <div className="h-5 w-24">
              <StaticStar urate={rating} size={15} />
            </div>
          </div>
        )}

        <div className="flex flex-col flex-grow">
          <h2
            className="font-bold text-xl hover:cursor-pointer"
            onClick={() => productClicked()}
          >
            {!price ? (
              <Skeleton className="w-1/4 h-5 my-1 rounded-xl" />
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

          {!name ? (
            <Skeleton className="w-1/2 h-6 rounded-xl mb-2 " />
          ) : (
            <h3
              className="font-semibold text-l h-6 mb-3 hover:text-slate-600 hover:cursor-pointer inline-block truncate"
              onClick={() => productClicked()}
            >
              {name}
            </h3>
          )}

          {!countInStock ? (
            <Skeleton className="w-1/4 h-4  rounded-xl" />
          ) : (
            <h4 className="text-xs font-thin">Stock left: {countInStock}</h4>
          )}
        </div>
        {!name ? (
          <div className="flex justify-center items-center  w-full my-2 hover:cursor-pointer select-none">
            <Skeleton className="w-full h-8  rounded-xl" />
          </div>
        ) : (
          <div
            className="flex justify-center items-center border border-black rounded-xl w-full my-2 hover:cursor-pointer select-none"
            onClick={() => addToCart()}
          >
            <h2 className="text-2xl mx-1">+</h2>
            <h3 className="text-sm">Cart</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
