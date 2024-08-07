import React from 'react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import Product from './components/Product'
const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({})

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });


  const FetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      setProduct(response.data);
      console.log(response.data.longDescription);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    FetchProduct();
  }, [id]);
  return (
    <div>
      <Navbar />
      <Product name={product.name} rating={product.rating} stock={product.countInStock} price={product.price} imageURL={product.image} />
      {product.description}
    </div >
  )
}

export default ProductPage;
