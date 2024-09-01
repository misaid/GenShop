import React from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CartItem from './components/CartItem';
import { Button } from '@/components/ui/button';

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
      console.log(response.data.cartItem);
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
      <div className="mt-12 h-scren w-screen flex flex-row items-center justify-center">
        <div className="flex-col max-h-[600px] overflow-y-scroll border border-black rounded-xl">
          {cart.map(item => (
            <div className="border border-b border-black">
              <CartItem
                key={item.productId}
                productid={item.productId}
                quantity={item.quantity}
                onChange={handleCartChange}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-5 flex-col">
          <h2 className="font-bold text-3xl">Checkout</h2>
          <h3>Items: </h3>
          <h3>Subtotal: </h3>
          <h3>Shipping: </h3>
          <h3>Total: </h3>
        </div>
      </div>
    </div>
  );
};

export default Cart;
