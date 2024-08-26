import Navbar from './components/Navbar';
import Product from './components/Product';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Categories from './components/Categories';
import { useSearchParams } from 'react-router-dom';
//pagination
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/selectfull';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [validPage, setValidPage] = useState(true);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const departmentParam = searchParams.get('department') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortbyParam = searchParams.get('sortby') || 'new';
  const departmentArray = departmentParam ? departmentParam.split(',') : [];
  const categoryArray = categoryParam ? categoryParam.split(',') : [];

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const handleValueChange = value => {
    // Should no remember the page
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortby', value);
    newParams.delete('page');
    setSearchParams(newParams);
    console.log('Value:', value);
  };

  const handlePageChange = page => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.post(
        `/products?page=${currentPage}`,
        {
          department: departmentArray,
          category: categoryArray,
        },
        {
          withCredentials: true,
        }
      );
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setValidPage(true);
      setTotalProducts(response.data.totalProducts);
    } catch (error) {
      setValidPage(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    setCurrentPage(page);
  }, [currentPage, page, departmentParam, categoryParam]);
  return (
    <div>
      <Navbar />
      <div className="w-full h-7 bg-green-100 flex items-center border-b border-gray-300 mb-5">
        <div className="ml-3 w-48 flex">
          <h3 className="text-sm font-light">
            {12 * (currentPage - 1) + 1}-
            {Math.min(totalProducts, 12 * currentPage)} of {totalProducts}{' '}
            products
          </h3>
        </div>
        <div className=" h-7 flex items-center justify-end w-full mr-3">
          <div>
            <Select value={sortbyParam} onValueChange={handleValueChange}>
              <SelectTrigger className="w-36 h-5 text-[10px]">
                <SelectValue placeholder="new" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="text-s" value="new">
                  Newest arrivals
                </SelectItem>
                <SelectItem className="text-s" value="priceDesc">
                  Price: High to Low
                </SelectItem>
                <SelectItem className="text-s" value="priceAsc">
                  Price: Low to High
                </SelectItem>
                <SelectItem className="text-s" value="ratingDesc">
                  Rating: High to Low
                </SelectItem>
                <SelectItem className="text-s" value="ratingAsc">
                  Rating: Low to High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div>
        {!validPage ? (
          <div>
            <div>Invalid Page</div>
          </div>
        ) : (
          <div className="flex flex-1 h-full space-x-24">
            <Categories />
            <div className=" flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

              <div className="my-8">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          <PaginationPrevious />
                        </button>
                      </PaginationItem>
                    )}

                    {currentPage - 1 > 0 && (
                      <PaginationItem>
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          <PaginationLink>{currentPage - 1}</PaginationLink>
                        </button>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <button onClick={() => handlePageChange(currentPage)}>
                        <PaginationLink isActive>{currentPage}</PaginationLink>
                      </button>
                    </PaginationItem>

                    {currentPage + 1 <= totalPages && (
                      <PaginationItem>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          <PaginationLink>{currentPage + 1}</PaginationLink>
                        </button>
                      </PaginationItem>
                    )}

                    {currentPage + 2 <= totalPages && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {currentPage + 2 <= totalPages && (
                      <PaginationItem>
                        <button onClick={() => handlePageChange(totalPages)}>
                          <PaginationLink>{totalPages}</PaginationLink>
                        </button>
                      </PaginationItem>
                    )}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          <PaginationNext />
                        </button>
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
