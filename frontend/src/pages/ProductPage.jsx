import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { NumericFormat } from 'react-number-format';
import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StaticStar } from './components/StaticStar';
import { Skeleton } from '@/components/ui/skeleton';
import Product from './components/Product';
const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [selectedValue, setSelectedValue] = useState('1'); // Default value is "1"
  const [stock, setStock] = useState('');
  const [imageLoading, setImageloading] = useState(false);
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
      toast.success(selectedValue + ' ' + product.name + ' added to cart');
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

  return (
    <div>
      <Toaster />
      <div className="mt-12 flex flex-row bg-slate-50 mx-48 space-x-24 rounded-xl p-5 ">
        <div className="w-[300px] sm:w-[350px] md:w-[400px] lg:w-[450px] h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] m-10 flex flex-col relative">
          {!imageLoading && (
            <div className="w-full h-full rounded-xl">
              <Skeleton className="w-full h-full rounded-xl" />
              <h3 className="font-light mt-1 text-sm">&nbsp;</h3>
            </div>
          )}
          <img
            src={product.image}
            alt={product.name}
            onLoad={() => setImageloading(true)}
            style={imageLoading ? {} : { display: 'none' }} // Corrected 'stye' to 'style'
            className="w-full h-full rounded-xl object-cover"
          />
          {imageLoading && (
            <h3 className="font-light mt-1 text-sm">
              Stock: {product.countInStock}
            </h3>
          )}
        </div>
        <div className="flex flex-col max-w-[600px] justify-center space-y-3">
          <div>
            <h2 className="text-4xl font-bold ">{product.name}</h2>
            <StaticStar urate={product.rating} size={20} />
            <h2 className="font-bold text-2xl">
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
          <p className="text-l leading-normal">{product.description}</p>
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
