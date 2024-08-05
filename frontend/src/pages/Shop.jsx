import Navbar from "./components/Navbar";
import Product from "./components/Product";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
//pagination
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
//
const Shop = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  // const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const fetchProducts = async () => {
    try {
      console.log("fetching data for page", currentPage);
      const response = await axiosInstance.get("/products" + `?page=${currentPage}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);
  return (
    <div>
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="col-span-1">
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
      <div></div>
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
            </PaginationItem>)}

          {currentPage + 2 <= totalPages && (
            <PaginationItem>
              <PaginationLink href={`?page=${totalPages}`}>{totalPages}</PaginationLink>
            </PaginationItem>)}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext href={`?page=${currentPage + 1}`} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Shop;
