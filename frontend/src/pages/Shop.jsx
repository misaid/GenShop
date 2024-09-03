import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
//Page Components
import Product from './components/Product';
import Categories from './components/Categories';
import Department from './components/Department';
//Pagination Components
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
//Select Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/selectfull';
import { Input } from '@/components/ui/input';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [validPage, setValidPage] = useState(true);
  const [searchItem, setSearchItem] = useState('');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const departmentParam = searchParams.get('department') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortbyParam = searchParams.get('sortby') || 'new';
  const itemQueryParam = searchParams.get('item') || '';
  const departmentArray = departmentParam ? departmentParam.split(',') : [];
  const categoryArray = categoryParam ? categoryParam.split(',') : [];

  const start = 12 * (page - 1) + 1;
  const end = Math.min(totalProducts, 12 * page);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const handleValueChange = value => {
    // Should no remember the page
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortby', value);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = page => {
    window.scrollTo(0, 0);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.post(
        `/products`,
        {
          page: page,
          department: departmentArray,
          category: categoryArray,
          sortType: sortbyParam,
          item: itemQueryParam,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setValidPage(true);
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);
        console.log(validPage);
      }
    } catch (error) {
      setValidPage(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, departmentParam, categoryParam, sortbyParam, itemQueryParam]);
  return (
    <div>
      <div className="w-full h-7 bg-green-50 flex border-b border-gray-300 mb-5 items-center">
        <div className="ml-3 w-48 flex">
          <h3 className="text-sm font-light">
            {start}-{end} of {totalProducts} products
          </h3>
        </div>

        <div className=" h-7 flex w-full items-center justify-end mr-3">
          <div>
            <Select value={sortbyParam} onValueChange={handleValueChange}>
              <SelectTrigger className="w-36 h-5 text-[10px]">
                <SelectValue placeholder="new" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest arrivals</SelectItem>
                <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                <SelectItem value="ratingDesc">Rating: High to Low</SelectItem>
                <SelectItem value="ratingAsc">Rating: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <div className="flex h-full w-full">
          {departmentParam ? <Categories /> : <Department />}

          <div className="ml-20 h-full">
            {!validPage ? (
              <div className="flex justify-center items-center w-[1150px] h-[800px]">
                <div>
                  <img
                    className="max-w-[300px]"
                    src="https://moprojects.s3.us-east-2.amazonaws.com/Eprj/404-error.svg"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[1150px]">
                {products.map(product => (
                  <div key={product._id} className="col-span-1">
                    <Product
                      product={product}
                      name={product.name}
                      rating={product.rating}
                      stock={product.countInStock}
                      price={product.price}
                      imageURL={product.image}
                      productId={product._id}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="my-8 ">
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <button onClick={() => handlePageChange(page - 1)}>
                        <PaginationPrevious />
                      </button>
                    </PaginationItem>
                  )}

                  {page - 1 > 0 && (
                    <PaginationItem>
                      <button onClick={() => handlePageChange(page - 1)}>
                        <PaginationLink>{page - 1}</PaginationLink>
                      </button>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <button onClick={() => handlePageChange(page)}>
                      <PaginationLink isActive>{page}</PaginationLink>
                    </button>
                  </PaginationItem>

                  {page + 1 <= totalPages && (
                    <PaginationItem>
                      <button onClick={() => handlePageChange(page + 1)}>
                        <PaginationLink>{page + 1}</PaginationLink>
                      </button>
                    </PaginationItem>
                  )}

                  {page + 2 <= totalPages && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {page + 2 <= totalPages && (
                    <PaginationItem>
                      <button onClick={() => handlePageChange(totalPages)}>
                        <PaginationLink>{totalPages}</PaginationLink>
                      </button>
                    </PaginationItem>
                  )}

                  {page < totalPages && (
                    <PaginationItem>
                      <button onClick={() => handlePageChange(page + 1)}>
                        <PaginationNext />
                      </button>
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
