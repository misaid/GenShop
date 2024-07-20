import Navbar from "./components/Navbar";
import Product from "./components/Product";
import React, { useState, useEffect } from "react";
import axios from "axios";
const Shop = () => {
  const [products, setProducts] = useState([]);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
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
      Shop
    </div>
  );
};

export default Shop;
