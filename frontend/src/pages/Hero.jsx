import React from 'react';
import { Link } from 'react-router-dom';
import Pear from '../assets/pear.png';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Apple from '../assets/apple.png';
import Arasaka from '../assets/arasaka.png';
import Chalice from '../assets/chalice.png';
import Eldenring from '../assets/eldenring.png';
import Gpu from '../assets/gpu.png';
import { useState, useEffect } from 'react';

const Hero = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/shop');
  };
  const images = [Apple, Arasaka, Chalice, Eldenring];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  });
  return (
    <div
      style={{ minHeight: 'calc(100vh - 200px)' }}
      className="bg-white flex items-center"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
              AI-Crafted Innovations
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Discover unique products born from the fusion of artificial
              intelligence and human creativity. Explore our collection of
              products and experience the future today.
            </p>
            <div className="space-x-4">
              <Button
                size="lg"
                onClick={handleClick}
                className="bg-black text-white hover:bg-gray-800"
              >
                Explore Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-black border-black hover:bg-gray-100"
                onClick={() =>
                  (window.location.href =
                    'https://github.com/misaid/Ecommerce-Website')
                }
              >
                How It Works
              </Button>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 rounded-full"></div>
            <img
              src={images[currentImageIndex]}
              className="w-full h-full object-cover rounded-lg animate-fade transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
