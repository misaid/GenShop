import Navbar from "./components/Navbar";
import Product from "./components/Product";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
//pagination
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
//
const Shop = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  // const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get("page") || 1;
  const totalPages = 321;
  const [currentPage, setCurrentPage] = useState(page);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const fetchProducts = async () => {
    try {
      console.log("fetching data for page", currentPage);
      const response = await axiosInstance.get("/products");
      setProducts(response.data);
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
              <PaginationPrevious href="#" />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/page=" >{currentPage}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">{currentPage + 1}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">321</PaginationLink>
          </PaginationItem>
          {currentPage == totalPages && (
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>)}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Shop;
