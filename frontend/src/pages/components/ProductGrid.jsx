import Product from './Product';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
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
//
const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page')) || 1;
  const departmentParam = searchParams.get('department') || '';
  const categoryParam = searchParams.get('category') || '';
  const departmentArray = departmentParam ? departmentParam.split(',') : [];
  const categoryArray = categoryParam ? categoryParam.split(',') : [];

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [validPage, setValidPage] = useState(true);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const onPaginationClick = page => {
    navigate(`?page=${page}`);
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
    } catch (error) {
      setValidPage(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    setCurrentPage(page);
  }, [currentPage, departmentArray, categoryArray]);
  return (
    <div>
      {!validPage ? (
        <div>
          <div>Invalid Page</div>
        </div>
      ) : (
        <div className="flex flex-1 h-full space-x-24">
          <div className="bg-sky-200 w-[300px] h-[800px]">
            <div>
              <h1>Categories!</h1>
            </div>
          </div>
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
                      <Link to={`?page=${currentPage - 1}`}>
                        <PaginationPrevious />
                      </Link>
                    </PaginationItem>
                  )}

                  {currentPage - 1 > 0 && (
                    <PaginationItem>
                      <Link to={`?page=${currentPage - 1}`}>
                        <PaginationLink>{currentPage - 1}</PaginationLink>
                      </Link>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <Link to={`?page=${currentPage}`}>
                      <PaginationLink isActive>{currentPage}</PaginationLink>
                    </Link>
                  </PaginationItem>

                  {currentPage + 1 <= totalPages && (
                    <PaginationItem>
                      <Link to={`?page=${currentPage + 1}`}>
                        <PaginationLink>{currentPage + 1}</PaginationLink>
                      </Link>
                    </PaginationItem>
                  )}

                  {currentPage + 2 <= totalPages && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {currentPage + 2 <= totalPages && (
                    <PaginationItem>
                      <Link to={`?page=${totalPages}`}>
                        <PaginationLink>{totalPages}</PaginationLink>
                      </Link>
                    </PaginationItem>
                  )}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <Link to={`?page=${currentPage + 1}`}>
                        <PaginationNext />
                      </Link>
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
