// External imports
import { PackageIcon, TruckIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Internal imports
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * The order item component used in the orders page
 * @param {object} order - The order object
 * @returns {JSX.Element} - The order item component
 */
export default function OrderItem({ order }) {
  const navigate = useNavigate();
  const statusColor = {
    Processing: 'bg-yellow-500',
    Shipped: 'bg-blue-500',
    Delivered: 'bg-green-500',
    paid: 'bg-green-500',
  };
  function handleClick(id) {
    navigate(`/product/${id}`);
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Order #{order.orderNumber}
        </CardTitle>
        <Badge className={statusColor[order.status]}>{order.status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Order placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p>Total: ${order.total}</p>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-4">
          <div className="flex -space-x-4 rtl:space-x-reverse overflow-x-auto max-w-md">
            {order.products.map((item, index) => (
              <img
                key={index}
                className="w-20 h-20 border-2 border-white cursor-pointer rounded-md dark:border-gray-800"
                src={item.image}
                alt={item.name}
                onClick={() => handleClick(item._id)}
              />
            ))}
          </div>
          <div className="text-sm max-h-[100px] overflow-auto">
            {order.orderItems.map((item, index) => {
              const product = order.products.find(
                product => product._id === item.productId
              );
              return (
                <p key={index}>
                  {item.quantity}x{' '}
                  <span
                    className="hover:text-gray-700 cursor-pointer"
                    onClick={() => handleClick(item.productId)}
                  >
                    {product ? product.name : item.name}
                  </span>
                  {' - $'}
                  {(
                    (product ? product.price : item.price) * item.quantity
                  ).toFixed(2)}
                </p>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <PackageIcon className="mr-2 h-4 w-4" />
          Track Order
        </Button>
      </CardFooter>
    </Card>
  );
}
