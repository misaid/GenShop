import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StaticStar } from './components/StaticStar';
import Product from './components/Product';
const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [selectedValue, setSelectedValue] = useState('1'); // Default value is "1"
  const [stock, setStock] = useState('');
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const handleValueChange = value => {
    setSelectedValue(value); // Update state with the new value
  };

  const handleSubmit = async event => {
    event.preventDefault(); // Prevent the default form submission behavior
    try {
      await axiosInstance.post(
        `/cart`,
        {
          flag: 'add',
          productId: id,
          quantity: selectedValue,
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

  const FetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      setProduct(response.data);
      // more professional way of handling stock
      setStock(Math.min(response.data.countInStock, 30));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    FetchProduct();
  }, [id]);
  // <Product name={product.name} rating={product.rating} stock={product.countInStock} price={product.price} imageURL={product.image} />
  return (
    <div>
      <Navbar />
      <div className="flex flex-row bg-slate-100 mx-10 rounded-xl">
        <div className="m-10 flex flex-col ">
          <img
            src={product.image}
            alt={product.name}
            className="h-[500px] rounded-xl"
          />
          <h3 className="font-light mt-1 text-sm">
            Stock: {product.countInStock}
          </h3>
        </div>
        <div className="flex flex-col max-w-[500px] justify-center ml-24 space-y-3">
          <h2 className="text-4xl font-bold ">{product.name}</h2>
          <StaticStar urate={4} />
          <p className="text-l">{product.description}</p>
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
            <Button type="submit">Cart</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
