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
import { Search, RefreshCw } from 'lucide-react';
import MobileDropdownCategories from './components/MobileDropdownCategories';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [validPage, setValidPage] = useState(true);
  const [searchItem, setSearchItem] = useState('');
  const [loading, setLoading] = useState(true);

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

      setValidPage(true);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setValidPage(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, departmentParam, categoryParam, sortbyParam, itemQueryParam]);
  return !loading ? (
    <div>
      <div className="w-full sidebargone:h-7 h-12 flex border-b border-gray-300 mb-5 items-center">
        <div className="ml-3 w-full sticky sm:static flex">
          <h3 className="text-sm font-light text-muted-foreground flex">
            <span className="hidden sm:block mr-1">
              {start}-{end} of
            </span>
            {totalProducts} products
          </h3>
        </div>

        <div className="w-full h-full hidden sidebargone:block">
          <div className="h-7 flex w-full items-center justify-end mr-3 ">
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

        <div className="w-full justify-end flex sidebargone:hidden mr-3">
          <div className="w-max">
            <MobileDropdownCategories />
          </div>
        </div>
      </div>

      <div>
        <div className="flex h-full w-full">
          <div className="w-full flex-1 h-full hidden sidebargone:block">
            {departmentParam ? <Categories /> : <Department />}
          </div>

          <div className="flex h-full w-full sidebargone:mx-4 flex-col items-center">
            {validPage ? (
              <div className="grid grid-cols-2 threeto2:grid-cols-3 fourto3:grid-cols-4 md:gap-x-4 gap-y-4 gap-x-2  max-w-max min-w-max ">
                {products.map(product => (
                  <div key={product._id} className="col-span-1 w-full">
                    <Product product={product} />
                  </div>
                ))}
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
                    We couldn't find any items matching your search. Try
                    adjusting your query or clearing the search.
                  </p>
                </div>
              </div>
            )}
            <div className="my-8">
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
  ) : null;
};

export default Shop;
