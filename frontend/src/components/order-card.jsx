'use client';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PackageIcon, TruckIcon } from "lucide-react"

export function OrderCard({
  orderNumber = "ORD-12345",
  status = "Shipped",
  date = "June 15, 2023",
  total = "$129.99",

  items = [
    { name: "Wireless Earbuds", quantity: 1, image: "/placeholder.svg?height=80&width=80" },
    { name: "Phone Case", quantity: 2, image: "/placeholder.svg?height=80&width=80" },
    { name: "Charging Cable", quantity: 1, image: "/placeholder.svg?height=80&width=80" },
  ]
}) {
  const statusColor = {
    Processing: "bg-yellow-500",
    Shipped: "bg-blue-500",
    Delivered: "bg-green-500"
  }

  return (
    (<Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Order #{orderNumber}</CardTitle>
        <Badge className={statusColor[status]}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col space-y-1 text-sm text-gray-500 dark:text-gray-400">
          <p>Order placed on {date}</p>
          <p>Total: {total}</p>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-4">
          <div className="flex -space-x-4 rtl:space-x-reverse">
            {items.map((item, index) => (
              <img
                key={index}
                className="w-20 h-20 border-2 border-white rounded-md dark:border-gray-800"
                src={item.image}
                alt={item.name} />
            ))}
          </div>
          <div className="text-sm">
            {items.map((item, index) => (
              <p key={index}>
                {item.quantity}x {item.name}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <PackageIcon className="mr-2 h-4 w-4" />
          Track Order
        </Button>
        <Button variant="secondary">
          <TruckIcon className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>)
  );
}