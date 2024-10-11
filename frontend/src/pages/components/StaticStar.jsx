// External Imports
import { Rating } from 'react-simple-star-rating';

/**
 * the static star component used in the product card and product page
 * @param {number} urate - the rating of the product
 * @param {number} size - the size of the star
 * @returns {JSX.Element} - StaticStar
 */
export default function StaticStar({ urate, size }) {
  const rating = urate;
  return (
    <Rating
      size={size}
      SVGclassName="inline"
      readonly={true}
      initialValue={rating}
      fillColor={'#000000'}
    />
  );
}
