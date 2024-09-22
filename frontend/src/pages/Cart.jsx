import React from 'react';
import { NumericFormat } from 'react-number-format';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CartItem from './components/CartItem';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

//Checkbox Form Components
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
//stripe
import { loadStripe } from '@stripe/stripe-js';

const FormSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number().min(0, { message: 'Price must be positive' }),
    })
  ),
});

const Cart = () => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  const { cartCount, setCartCount } = useCart();
  const [cartInfo, setCartInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [numItems, setNumItems] = useState(0);
  const [firstLoad, setFirstLoad] = useState(true);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  });
  const { handleSubmit, setValue, getValues } = form;

  const onSubmit = data => {
    calculateSubtotal(data.items);
    calculateItems(data.items);
  };

  const calculateSubtotal = items => {
    let subtotal = 0;
    for (let i = 0; i < items.length; i++) {
      subtotal += items[i].price * items[i].quantity;
    }
    setSubtotal(subtotal);
  };

  const calculateItems = items => {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      count += items[i].quantity;
    }
    setNumItems(count);
  };

  const calculateItems2 = items => {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      count += items[i].quantity;
    }
    setCartCount(count);
  };

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/cart', {
        withCredentials: true,
      });

      const cartData = response.data.cartInfo;
      setCartInfo(cartData);
      console.log(cartData);

      const transformedItems = cartData.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));
      calculateItems2(transformedItems);

      if (firstLoad) {
        // Set initial values
        setValue('items', transformedItems);
        calculateSubtotal(transformedItems);
        calculateItems(transformedItems);
        setLoading(false);
        setFirstLoad(false);
      } else {
        const currentValues = getValues('items');

        const currentMap = new Map(currentValues.map(ci => [ci.productId, ci]));

        const updatedItems = transformedItems.map(ti => {
          const existingItem = currentMap.get(ti.productId);
          if (existingItem) {
            return { ...existingItem, quantity: ti.quantity, price: ti.price };
          }
          return ti;
        });

        const allItems = currentValues
          .filter(ci => updatedItems.some(ui => ui.productId === ci.productId))
          .map(ci => {
            const updatedItem = updatedItems.find(
              ui => ui.productId === ci.productId
            );
            return updatedItem ? updatedItem : ci;
          });

        setValue('items', allItems);
        calculateSubtotal(allItems);
        calculateItems(allItems);
      }
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

  const makePayment = async () => {
    try {
      const stripe = await loadStripe(stripePublicKey);
      const session = await axiosInstance.post(
        '/checkout',
        { items: getValues('items') },
        { withCredentials: true }
      );
      const result = await stripe.redirectToCheckout({
        sessionId: session.data.id,
      });
      if (result.error) {
        console.log(result.error.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    !loading && (
      <div className="mt-12 w-screen flex flex-col space-y-8 md:space-y-0 md:flex-row items-center md:items-start justify-center h-full">
        <div className="flex-col max-h-[600px]  overflow-y-scroll force-scrollbar rounded-xl px-6 shadow-sm bg-white border-gray-200 border ">
          {cartInfo && cartInfo.length > 0 ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
              >
                <FormField
                  control={form.control}
                  name="items"
                  render={() => (
                    <FormItem>
                      <div className="mb-4 border-grey-300 border-b border-3 w-full">
                        <div className="p-4">
                          <FormLabel className="sticky text-2xl flex justify-center">
                            Cart
                          </FormLabel>
                          <FormDescription></FormDescription>
                        </div>
                      </div>
                      {cartInfo.map(item => (
                        <FormField
                          key={item.product._id}
                          control={form.control}
                          name="items"
                          render={({ field }) => (
                            <FormItem
                              key={item.product._id}
                              className="flex flex-row items-center space-x-3 space-y-0 px-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form
                                    .getValues('items')
                                    .some(
                                      i => i.productId === item.product._id
                                    )}
                                  onCheckedChange={checked => {
                                    const updatedItems = checked
                                      ? [
                                          ...form.getValues('items'),
                                          {
                                            productId: item.product._id,
                                            quantity: item.quantity,
                                            price: item.product.price,
                                          },
                                        ]
                                      : form
                                          .getValues('items')
                                          .filter(
                                            i =>
                                              i.productId !== item.product._id
                                          );

                                    form.setValue('items', updatedItems);
                                    form.handleSubmit(onSubmit)(); // Trigger form submission
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-l">
                                <div className="border-b border-grey-300">
                                  <CartItem
                                    key={item.product._id}
                                    quantity={item.quantity}
                                    product={item.product}
                                    onChange={handleCartChange}
                                  />
                                </div>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <div className="w-[600px] flex-col ">
              <div className="border-b border-grey-400 w-full flex justify-center items-center">
                <h2 className=" p-4 text-2xl">Cart</h2>
              </div>
              <div className="w-full flex justify-center items-center">
                <h2 className="p-4 font-normal">Cart is empty</h2>
              </div>
            </div>
          )}
        </div>
        <div className="flex mx-5 bg-white h-max w-80 flex-col p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3>Subtotal ({numItems} items):</h3>
            <h3 className="font-semibold text-gray-700 truncate">
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
          <div>
            <Button onClick={makePayment}>Proceed to Checkout</Button>
          </div>
        </div>
      </div>
    )
  );
};

export default Cart;
