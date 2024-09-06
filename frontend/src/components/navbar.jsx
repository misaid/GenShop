'use client'

import * as React from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ShoppingBag, Wand2, ShoppingCart, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
  const categories = [
    'Electronics',
    'Clothing and Accessories',
    'Home and Garden',
    'Health and Beauty',
    'Toys and Games',
    'Sports and Outdoors',
    'Automotive',
    'Office Supplies',
    'Books and Media',
    'Crafts and Hobbies',
  ]

  return (
    (<nav className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 border-b">
          <Link href="/" className="text-2xl font-bold">
            Logo
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/shop" className="flex items-center space-x-1">
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Shop</span>
            </Link>
            <Link href="/generate" className="flex items-center space-x-1">
              <Wand2 className="w-5 h-5" />
              <span className="hidden sm:inline">Generate</span>
            </Link>
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-[200px] lg:w-[300px]" />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              <Badge
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-2.5">
                3
              </Badge>
              <span className="sr-only">Cart</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/account">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="py-2 overflow-x-auto">
          <ul className="flex space-x-4 whitespace-nowrap">
            {categories.map((category, index) => (
              <li key={index}>
                <Button variant="ghost" className="text-sm">
                  {category}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>)
  );
}