import { NumericFormat } from 'react-number-format';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CartItem = ({ productid, quantity, onChange }) => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [product, setProduct] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(String(quantity)); // Default value is "1"
  const [stock, setStock] = useState('');
  const navigate = useNavigate();

  const fetchProduct = async () => {
    // console.log('Fetching product:', productid);
    try {
      const response = await axiosInstance.get(`/product/${productid}`);
      setProduct(response.data);
      setStock(Math.min(response.data.countInStock, 30));
    } catch (error) {
      console.error(
        'Error fetching product:',
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleValueChange = value => {
    setSelectedValue(value); // Update state with the new value
    console.log(selectedValue);
    sendToCart(value);
  };

  const sendToCart = async value => {
    try {
      console.log('Sending to cart:', productid, value);
      await axiosInstance.post(
        `/cart`,
        {
          flag: 'set',
          productId: productid,
          quantity: value,
        },
        {
          withCredentials: true,
        }
      );
      console.log('Selected value:', selectedValue);
    } catch (error) {
      console.error(
        'Error adding to cart:',
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSubmit = async event => {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log('Selected value:', selectedValue);
  };
  const handleClick = async () => {
    try {
      console.log('Deleting product:', productid);
      await axiosInstance.post(
        `/cart`,
        {
          flag: 'delete',
          productId: productid,
        },
        {
          withCredentials: true,
        }
      );
      console.log('Product deleted:', productid);
      if (typeof onChange === 'function') {
        onChange(); // This should trigger handleCartChange in Cart.jsx
        console.log('onChange was called successfully');
      } else {
        console.error('onChange is not a function');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    <div className="flex flex-row w-[600px] h-[200px] bg-slate-300 items-center p-5 my-3 border border-black rounded-xl space-x-3">
      <div>
        {!imageLoading && <Skeleton className="h-[150px] w-[150px]" />}
        <div className="max-w-[150px] max-h-[150px]">
          <img
            src={product.image}
            alt={product.name}
            onLoad={() => setImageLoading(true)}
            style={imageLoading ? {} : { display: 'none' }}
            className="rounded"
          />
        </div>
      </div>
      <div>
        <h2 className="text-xl">{product.name}</h2>
        <h2 className="font-bold text-l">
          <NumericFormat
            value={product.price}
            displayType={'text'}
            thousandSeparator=","
            prefix={'$'}
            decimalScale={2}
            fixedDecimalScale
          />
        </h2>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <h3>Qtw: </h3>
          <Select value={selectedValue} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[60px]">
              <SelectValue placeholder={selectedValue} />
            </SelectTrigger>
            <SelectContent>
              {[...Array(stock)].map((_, index) => {
                const value = (index + 1).toString(); // Convert index to string to use as value
                return (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </form>
      </div>
      <Button variant="destructive" onClick={handleClick}>
        Delete
      </Button>
    </div>
  );
};

export default CartItem;
