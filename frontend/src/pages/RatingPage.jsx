import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
import Star from './components/Star';
// Card
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const RatingPage = () => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [yourRating, setYourRating] = useState(0);
  const [userId, setUserId] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  console.log(page);
  const [validPage, setValidPage] = useState(true);
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.post(
        '/getrating',
        {
          page: page,
        },
        {
          withCredentials: true,
        }
      );
      setProducts(response.data.products);
      setTotalProducts(response.data.totalProducts);
      setTotalPages(response.data.totalPages);
      setUserId(response.data.userId);
      setLoading(false);
    } catch (error) {
      setValidPage(false);
      console.log(error);
    }
  };

  function handleClick(id) {
    navigate(`/product/${id}`);
  }
  const handlePageChange = page => {
    window.scrollTo(0, 0);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  const start = 10 * (page - 1) + 1;
  const end = Math.min(totalProducts, 10 * page);
  useEffect(() => {
    fetchProducts();
  }, [page]);
  return validPage ? (
    !loading ? (
      <div className="w-full h-full">
        <div className="w-full flex border-b border-gray-300 mb-6 py-2 px-4">
          <h3 className="text-sm text-gray-700 font-medium">
            {start}-{end} of {totalProducts} orders
          </h3>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Rating Page</h2>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto p-6">
            {products.map(product => {
              const userRating =
                (product.rating && product.rating[userId.toString()]) || 0;
              return (
                <Card key={product._id}>
                  <CardHeader>
                    <CardTitle
                      className="hover:text-gray-600 hover:cursor-pointer truncate h-10"
                      onClick={() => handleClick(product._id)}
                    >
                      {product.name}
                    </CardTitle>

                    <CardDescription className="h-1">
                      {userRating ? (
                        <h2>Change your rating</h2>
                      ) : (
                        <h2>Add a rating</h2>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <Separator className="my-4" />
                  <CardContent>
                    <div className="flex flex-col w-full items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        onClick={() => handleClick(product._id)}
                        className="w-32 h-32 object-cover border border-gray-300 rounded-lg mb-4 hover:cursor-pointer"
                      />
                      <Star urate={userRating} productId={product._id} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="font-light text-sm text-muted-foreground">
                      Average Rating: {product.averageRating}
                    </p>
                  </CardFooter>
                </Card>
              );
            })}
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
    ) : null
  ) : (
    <div>Failure</div>
  );
};

export default RatingPage;
