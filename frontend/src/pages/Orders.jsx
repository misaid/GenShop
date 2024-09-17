import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import OrderItem from './components/OrderItem';
//pagination
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

const Orders = () => {
  const [fullOrder, setOrderItem] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  console.log(page);
  const [validPage, setValidPage] = useState(true);

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const handlePageChange = page => {
    window.scrollTo(0, 0);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

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
      console.log(response.data.fullOrder);
      setValidPage(true);
      setLoading(false);
    } catch (error) {
      setValidPage(false);
      console.log(error);
    }
  }

  const start = 10 * (page - 1) + 1;
  const end = Math.min(totalOrders, 10 * page);

  useEffect(() => {
    fetchorders();
  }, [page]);

  return validPage ? (
    !loading ? (
      <div className="w-full flex-col">
        <div className=" w-full flex border-b border-gray-300 mb-5 p-0.5">
          <h3 className="text-sm ml-3  font-light overflow-hidden w-full">
            {start}-{end} of {totalOrders} orders
          </h3>
        </div>
        <div className="flex flex-col space-y-4">
          {fullOrder.map((orderItem, index) => (
            <div key={index}>
              <OrderItem key={1} order={orderItem} />
            </div>
          ))}
        </div>

        <div className="my-8 ">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <button onClick={() => handlePageChange(page - 1)}>
                    <PaginationPrevious />
                  </button>
                </PaginationItem>
              )}

              {page - 1 > 0 && (
                <PaginationItem>
                  <button onClick={() => handlePageChange(page - 1)}>
                    <PaginationLink>{page - 1}</PaginationLink>
                  </button>
                </PaginationItem>
              )}

              <PaginationItem>
                <button onClick={() => handlePageChange(page)}>
                  <PaginationLink isActive>{page}</PaginationLink>
                </button>
              </PaginationItem>

              {page + 1 <= totalPages && (
                <PaginationItem>
                  <button onClick={() => handlePageChange(page + 1)}>
                    <PaginationLink>{page + 1}</PaginationLink>
                  </button>
                </PaginationItem>
              )}

              {page + 2 <= totalPages && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {page + 2 <= totalPages && (
                <PaginationItem>
                  <button onClick={() => handlePageChange(totalPages)}>
                    <PaginationLink>{totalPages}</PaginationLink>
                  </button>
                </PaginationItem>
              )}

              {page < totalPages && (
                <PaginationItem>
                  <button onClick={() => handlePageChange(page + 1)}>
                    <PaginationNext />
                  </button>
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    ) : null
  ) : (
    <div className="w-full h-[800px] flex-col">
      <div className="w-full  flex ">
        <div className=" flex-col w-full  justify-center items-center">
          <div className="w-full h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No Results Found
              </h2>
              <p className="text-gray-600 mb-6 max-w-sm">
                We couldn't find any items matching your search. Try adjusting
                your query or clearing the search.
              </p>
            </div>
          </div>
          <div className="my-8 ">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <button onClick={() => handlePageChange(page - 1)}>
                      <PaginationPrevious />
                    </button>
                  </PaginationItem>
                )}

                {page - 1 > 0 && (
                  <PaginationItem>
                    <button onClick={() => handlePageChange(page - 1)}>
                      <PaginationLink>{page - 1}</PaginationLink>
                    </button>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <button onClick={() => handlePageChange(page)}>
                    <PaginationLink isActive>{page}</PaginationLink>
                  </button>
                </PaginationItem>

                {page + 1 <= totalPages && (
                  <PaginationItem>
                    <button onClick={() => handlePageChange(page + 1)}>
                      <PaginationLink>{page + 1}</PaginationLink>
                    </button>
                  </PaginationItem>
                )}

                {page + 2 <= totalPages && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {page + 2 <= totalPages && (
                  <PaginationItem>
                    <button onClick={() => handlePageChange(totalPages)}>
                      <PaginationLink>{totalPages}</PaginationLink>
                    </button>
                  </PaginationItem>
                )}

                {page < totalPages && (
                  <PaginationItem>
                    <button onClick={() => handlePageChange(page + 1)}>
                      <PaginationNext />
                    </button>
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
