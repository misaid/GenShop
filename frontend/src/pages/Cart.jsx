import React from 'react';
import { NumericFormat } from 'react-number-format';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CartItem from './components/CartItem';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [cartInfo, setCartInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [numItems, setNumItems] = useState(0);

  const calculateSubtotal = cartInfo => {
    let cstotal = 0;
    for (let i = 0; i < cartInfo.length; i++) {
      cstotal = cstotal + cartInfo[i].product.price * cartInfo[i].quantity;
    }
    setSubtotal(cstotal);
  };

  const cacluateItems = cartInfo => {
    let count = 0;
    for (let i = 0; i < cartInfo.length; i++) {
      console.log(cartInfo[i].quantity);
      count = count + cartInfo[i].quantity;
    }
    setNumItems(count);
  };

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/cart', {
        withCredentials: true,
      });
      setCartInfo(response.data.cartInfo);
      setLoading(false);
      calculateSubtotal(response.data.cartInfo);
      cacluateItems(response.data.cartInfo);
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
      {!loading && (
        <div className="mt-12 h-scren w-screen flex flex-row justify-center">
          <div className="flex-col max-h-[600px] overflow-y-scroll force-scrollbar rounded-xl px-6 bg-slate-50 shadow-md ">
            {cartInfo.map(item => (
              <div className="border-b border-grey-300">
                <CartItem
                  key={item.productId}
                  quantity={item.quantity}
                  product={item.product}
                  onChange={handleCartChange}
                />
              </div>
            ))}
          </div>
          <div className="flex mx-5 bg-slate-50 h-32 w-80 flex-col p-6 rounded-xl shadow-md">
            <div className="inline-flex space-x-2">
              <h3>Subtotal ({numItems} items):</h3>
              <h3 className="font-semibold text-gray-700">
                <NumericFormat
                  value={subtotal}
                  displayType={'text'}
                  thousandSeparator=","
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </h3>
            </div>
            <div className="mt-5 bg-green-300 rounded-2xl p-2 hover:cursor-pointer max-w-[195px] flex justify-center items-center">
              <h2>Proceed to Checkout</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
