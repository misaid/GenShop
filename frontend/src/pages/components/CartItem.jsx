import { NumericFormat } from 'react-number-format';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const TestCartItem = ({ productid, quantity, onChange, product }) => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(String(quantity));

  const addToCart = async () => {
    try {
      await axiosInstance.post(
        `/cart`,
        {
          flag: 'add',
          productId: product._id,
          quantity: quantity,
        },
        {
          withCredentials: true,
        }
      );
      onChange();
    } catch (error) {
      console.error(
        'Error adding to cart:',
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleValueChange = value => {
    setSelectedValue(value);
    sendToCart(value);
  };

  const sendToCart = async value => {
    try {
      await axiosInstance.post(
        `/cart`,
        {
          flag: 'set',
          productId: product._id,
          quantity: value,
        },
        {
          withCredentials: true,
        }
      );
      onChange();
    } catch (error) {
      console.error(
        'Error updating cart:',
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
  };

  const handleClick = async () => {
    try {
      await axiosInstance.post(
        `/cart`,
        {
          flag: 'delete',
          productId: product._id,
        },
        {
          withCredentials: true,
        }
      );
      toast.success(`${quantity} ${product.name} deleted from cart`, {
        action: {
          label: 'Undo',
          onClick: () => addToCart(),
        },
      });
      onChange();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full md:w-[600px] bg-slate-50 p-4 space-y-4 md:space-y-0 md:space-x-4 items-center">
      <Toaster />
      <div className="w-[150px] h-[150px] relative">
        {!imageLoading && <Skeleton className="absolute inset-0" />}
        <img
          src={product.image}
          alt={product.name}
          onLoad={() => setImageLoading(true)}
          style={imageLoading ? {} : { display: 'none' }}
          className="rounded w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col flex-grow justify-between space-y-2 md:space-y-0 md:space-x-2 md:flex-row items-center md:items-start text-center md:text-left">
        <div className="flex flex-col">
          <h2 className="text-xl font-medium truncate w-[200px] max-w-[200px]">
            {product.name}
          </h2>
          <h3 className="text-lg font-semibold text-gray-700">
            <NumericFormat
              value={product.price}
              displayType={'text'}
              thousandSeparator=","
              prefix={'$'}
              decimalScale={2}
              fixedDecimalScale
            />
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <h3 className="font-medium">Qty:</h3>
          <Select value={selectedValue} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[60px]">
              <SelectValue placeholder={selectedValue} />
            </SelectTrigger>
            <SelectContent>
              {[...Array(product.countInStock)].map((_, index) => {
                const value = (index + 1).toString();
                return (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </form>
        <Button variant="destructive" onClick={handleClick}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TestCartItem;
