import React, { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import axios from 'axios';

export function Star({ urate, productId }) {
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
export default Star;
