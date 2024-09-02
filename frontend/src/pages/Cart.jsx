import React from 'react';
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
      <div className="mt-12 h-scren w-screen flex flex-row justify-center">
        <div className="flex-col max-h-[600px] overflow-y-scroll rounded-xl px-6 bg-slate-50 shadow-md ">
          {cart.map(item => (
            <div className="border-b border-grey-300">
              <CartItem
                key={item.productId}
                productid={item.productId}
                quantity={item.quantity}
                onChange={handleCartChange}
              />
            </div>
          ))}
        </div>
        <div className="flex mx-5 bg-slate-50 h-32 w-80 flex-col p-6 rounded-xl shadow-md">
          <h3>
            Subtotal(num Items): <span className="font-bold">price</span>
          </h3>
          <div className="mt-5 bg-green-300 rounded-2xl p-2 hover:cursor-pointer max-w-[195px] flex justify-center items-center">
            <h2>Proceed to Checkout</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
