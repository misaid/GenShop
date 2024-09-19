import React from 'react';
import { Link } from 'react-router-dom';
import Pear from '../assets/pear.png';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Hero = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/shop');
  };
  // const images = [Apple, Arasaka, Chalice, Eldenring, Basketball, GPU];
  const [imageLoading, setImageLoading] = useState(false);
  const images = [
    'https://moprojects.s3.us-east-2.amazonaws.com/Eprj/1913c2ea-e558-435b-8617-422d667097ef.png',
    'https://moprojects.s3.us-east-2.amazonaws.com/Eprj/02497106-9b4f-463e-81d5-8b317a294d28.png',
    'https://moprojects.s3.us-east-2.amazonaws.com/Eprj/952b4061-2207-4664-b433-3ed2ddf3d19a.png',
    'https://moprojects.s3.us-east-2.amazonaws.com/Eprj/a6663fc7-025f-4218-a172-0f63004d2403.png',
    'https://moprojects.s3.us-east-2.amazonaws.com/Eprj/320b065d-af3b-4e81-a1bf-a55895aa5cf6.png',
    'https://moprojects.s3.us-east-2.amazonaws.com/Eprj/7e270afc-15e6-492d-b8b7-588d1a51cb27.png',
  ];

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
      className="bg-white flex items-center mt-4"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row  items-center justify-between gap-12">
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
            <div className="absolute inset-0 rounded-full h-full w-full"></div>

            {!imageLoading && (
              <Skeleton className="w-[350px] h-[350px] lg:w-[600px] lg:h-[600px] rounded-lg" />
            )}
            <img
              src={images[currentImageIndex]}
              className="w-[350px] h-[350px] lg:w-[600px] lg:h-[600px] object-cover rounded-lg animate-fade transform hover:scale-105 transition-transform duration-300"
              onLoad={() => setImageLoading(true)}
              style={imageLoading ? {} : { display: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
