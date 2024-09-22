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
import { Search, RefreshCw } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [selectedValue, setSelectedValue] = useState('1'); // Default value is "1"
  const [stock, setStock] = useState('');
  const [imageLoading, setImageloading] = useState(false);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [productDoesNotExist, setProductDoesNotExist] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setProductDoesNotExist(true);
      console.log(error);
    }
  };

  useEffect(() => {
    FetchProduct();
  }, [id]);

  return (
    !loading && (
      <div>
        <Toaster />

        {!productDoesNotExist ? (
          <div className="mt-12 flex flex-row bg-white pplchange:bg-slate-50  max-w-[1400px] mx-auto rounded-xl p-8 pplchange:space-x-12 lg:space-x-24  items-center justify-center ">
            <div className="pplchange:flex hidden w-[300px] sm:w-[350px] md:w-[400px] lg:w-[450px] h-[300px] overflow-hidden sm:h-[350px] md:h-[400px] lg:h-[450px] flex-col relative ">
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
            </div>

            <div className="flex flex-col max-w-[600px] justify-center space-y-3 mx-auto">
              <div>
                <div className="pplchange:hidden flex w-[350px] h-[350px] smpplchange:w-[400px] smpplchange:h-[400px] mdpplchange:w-[600px] mdpplchange:h-[600px] pplchange:w-[600px] pplchange:h-[600px] overflow-hidden flex-col relative mb-8">
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
                </div>

                <h2 className="text-4xl font-bold ">{product.name}</h2>
                <StaticStar urate={product.averageRating} size={20} />
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
                <h3 className="font-light mt-1 text-xs">
                  Stock: {product.countInStock}
                </h3>
              </div>
              <p className="text-l leading-normal">{product.description}</p>
              <form
                onSubmit={handleSubmit}
                className="flex items-center space-x-2"
              >
                <h3>Qty: </h3>
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
        ) : (
          <div className="w-full h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No Results Found
              </h2>
              <p className="text-gray-600 mb-6 max-w-sm">
                Product does not exist or was deleted
              </p>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default ProductPage;
