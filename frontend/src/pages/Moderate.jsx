// External Imports
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Internal Imports
import { Product } from './components';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { CheckIcon, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

/**
 * The Moderate page component
 * This page handles the moderation of all new products
 * Only the admin user can moderate the products
 * @returns {JSX.Element} - The Moderate page component
 */
export default function Moderate() {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [validPage, setValidPage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page')) || 1;

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  /**
   * Handles the page change
   * @param {number} page - The page number
   */
  function handlePageChange(page) {
    window.scrollTo(0, 0);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  }

  /**
   * Fetches the products
   */
  async function fetchProducts() {
    try {
      const response = await axiosInstance.get(
        `/moderate`,
        {
          page: page,
        },
        {
          withCredentials: true,
        }
      );

      setProducts(response.data.products);
      console.log('Products:', response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
      setValidPage(true);
      setLoading(false);
    } catch (error) {
      setValidPage(false);
      setLoading(false);
      console.log('Error fetching products:', error);
    }
  }

  /**
   * Deletes a product
   * @param {string} id - The product id
   */
  async function deleteProduct(id) {
    try {
      const response = await axiosInstance.post(
        `/deleteProduct/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log('Product deleted:', response);
      fetchProducts();
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Must be admin to delete product');
    }
  }

  /**
   * Approves a product
   * @param {string} id - The product id
   */
  async function approveProduct(id) {
    try {
      console.log('Approving product:', id);
      const response = await axiosInstance.post(
        `/moderate/${id}`,
        {
          flag: 'approve',
        },
        {
          withCredentials: true,
        }
      );
      console.log('Product approved:', response);
      fetchProducts();
      toast.success('Product approved');
    } catch (error) {
      toast.error('Must be admin to approve product');
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [page]);

  return validPage ? (
    !loading ? (
      <div className="w-full h-full space-y-8 mt-10">
        <Toaster />
        <div className="w-full flex flex-col items-center h-full justify-center space-y-4">
          {products.map(product => (
            <div
              key={product._id}
              className="w-full max-w-[350px] flex flex-col items-center justify-center space-y-1"
            >
              <Product product={product} />
              <div className="flex flex-row justify-between w-[188px] mobile:w-[250px] plg:w-[275px] border border-b-gray rounded-xl overflow-hidden bg-white shadow-md">
                <Button
                  variant="destructive"
                  onClick={() => deleteProduct(product._id)}
                >
                  <Trash2 />
                </Button>
                <Button variant="" onClick={() => approveProduct(product._id)}>
                  <CheckIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="my-8">
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
}
