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
  const location = useLocation();
  const navigate = useNavigate();
  // const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page')) || 1;
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [validPage, setValidPage] = useState(true);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const fetchProducts = async () => {
    try {
      console.log('fetching data for page', currentPage);
      const response = await axiosInstance.get(
        '/products' + `?page=${currentPage}`
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
  }, [currentPage]);

  return (
    <div>
      {!validPage ? (
        <div>
          <Navbar />
          <div>Invalid Page</div>
        </div>
      ) : (
        <>
          <Navbar />
          <div className="flex flex-1 items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
              {products.map(product => (
                <div
                  key={product._id}
                  className="col-span-1"
                  onClick={productClicked(product._id)}
                >
                  <Product
                    name={product.name}
                    rating={product.rating}
                    stock={product.countInStock}
                    price={product.price}
                    imageURL={product.image}
                  />
                </div>
              ))}
            </div>
          </div>
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
        </>
      )}
    </div>
  );
};

export default Shop;
