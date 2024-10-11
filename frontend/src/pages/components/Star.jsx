// External imports
import React, { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import axios from 'axios';

/**
 * the star component
 * @param {number} urate - the rating of the product
 * @param {string} productId - the product id
 * @returns {JSX.Element} - Star
 */
export default function Star({ urate, productId }) {
  const [rating, setRating] = useState(urate);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const size = 28;
  async function handleRating(rate) {
    try {
      const response = await axiosInstance.post(
        '/addrating',
        {
          productId: productId,
          rating: rate,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Rating
      size={size}
      SVGclassName="inline"
      readonly={false}
      initialValue={urate}
      fillColor={'#000000'}
      onClick={handleRating}
    />
  );
}
