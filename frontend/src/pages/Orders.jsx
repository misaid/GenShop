import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import OrderItem from './components/OrderItem';

const Orders = () => {
  const [fullOrder, setOrderItem] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const [validPage, setValidPage] = useState(true);

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  async function fetchorders() {
    try {
      const response = await axiosInstance.post(
        `/orders`,
        {
          page: page,
        },
        {
          withCredentials: true,
        }
      );

      setTotalOrders(response.data.totalOrders);
      setTotalPages(response.data.totalPages);
      setOrderItem(response.data.fullOrder);
      console.log(response.data.fullOrder.length);
    } catch (error) {
      setValidPage(false);
      console.log(error);
    }
  }

  const start = 10 * (page - 1) + 1;
  const end = Math.min(totalOrders, 10 * page);

  useEffect(() => {
    fetchorders();
  }, []);
  return validPage ? (
    <div className="w-full flex-col">
      <div className="ml-3 w-48 flex">
        <h3 className="text-sm font-light overflow-hidden mb-5">
          {start}-{end} of {totalOrders} orders
        </h3>
      </div>
      <div className="flex flex-col">
        {fullOrder.map((orderItem, index) => (
          <div key={index}>
            <OrderItem key={1} order={orderItem} />
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-[800px]">
      <div>
        <img
          className="max-w-[300px]"
          src="https://moprojects.s3.us-east-2.amazonaws.com/Eprj/404-error.svg"
        />
      </div>
    </div>
  );
};

export default Orders;
