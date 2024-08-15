import React, { useState } from 'react';
import { Rating } from 'react-simple-star-rating';

export function StaticStar({ urate }) {
  const rating = urate;
  // Catch Rating value

  return (
    <Rating
      size={20}
      SVGclassName="inline"
      readonly={true}
      initialValue={rating}
      fillColor={'#000000'}
    />
  );
}
export default StaticStar;
