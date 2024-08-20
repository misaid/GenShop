import React from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CartItem from './components/CartItem';

const Cart = () => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/cart', {
        withCredentials: true,
      });
      setCart(response.data.cartItem);
    } catch (error) {
      console.error(
        'Error fetching cart:',
        error.response ? error.response.data : error.message
      );
    }
  };
  const handleCartChange = () => {
    console.log('Cart changed');
    fetchCart();
  };
  useEffect(() => {
    fetchCart();
  }, []);
  return (
    <div className="">
      <Navbar />
      <div className="h-scren w-screen flex flex-col items-center justify-center">
        <div className="flex-col">
          {cart.map(item => (
            <CartItem
              key={item.productId}
              productid={item.productId}
              quantity={item.quantity}
              onChange={handleCartChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cart;
