import Navbar from './components/Navbar';
import Product from './components/Product';
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
const Shop = () => {
  const [products, setProducts] = useState([]);
  // const [department, setDepartment] = useState('');
  // const [genres, setGenres] = useState([]);
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

  const fetchProducts = async () => {
    try {
      console.log(departmentArray);
      console.log(categoryArray);
      console.log('fetching data for page', currentPage);
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
  const productClicked = productId => () => {
    console.log('product clicked', productId);
    // history.push(`/product/${productId}`);
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchProducts();
    setCurrentPage(page);
  }, [location]);

  return (
    <div>
      {!validPage ? (
        <div>
          <Navbar />
          <div>Invalid Page</div>
        </div>
      ) : (
        <div>
          <Navbar onChange={fetchProducts} />

          <div className="flex flex-1 h-full space-x-24">
            <div className="bg-sky-200 w-[300px] h-[800px]">
              <div>
                <h1>Categories!</h1>
              </div>
            </div>
            <div className=" flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <div
                    key={product._id}
                    className="col-span-1"
                    // onClick={productClicked(product._id)}
                  >
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
                        <PaginationPrevious href={`?page=${currentPage - 1}`} />
                      </PaginationItem>
                    )}

                    {currentPage - 1 > 0 && (
                      <PaginationItem>
                        <PaginationLink href={`?page=${currentPage - 1}`}>
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationLink href={`?page=${currentPage}`}>
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>

                    {currentPage + 1 <= totalPages && (
                      <PaginationItem>
                        <PaginationLink href={`?page=${currentPage + 1}`}>
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {currentPage + 2 <= totalPages && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {currentPage + 2 <= totalPages && (
                      <PaginationItem>
                        <PaginationLink href={`?page=${totalPages}`}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext href={`?page=${currentPage + 1}`} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
