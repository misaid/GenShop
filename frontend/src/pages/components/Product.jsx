import { NumericFormat } from 'react-number-format';
import StaticStar from './StaticStar';
import { Skeleton } from '@/components/ui/skeleton';
import React, { useState } from 'react';
const Product = ({ name, rating, stock, price, imageURL }) => {
  const [imageLoading, setImageloading] = useState(false);
  return (
    <div className="h-[450px] w-[275px] border border-b-gray rounded-xl overflow-hidden">
      <div className="mx-3">
        <div className="flex flex-col items-center ">
          <div className="">
            {!imageLoading && (
              <Skeleton className="h-[270px] w-[300px] rounded-t-xl" />
            )}
            <img
              className="max-h-[270px] max-w-[300px] rounded-t-xl"
              src={imageURL}
              // src={`data:image/jpeg;base64,${imageURL}`}
              alt="product"
              onLoad={() => setImageloading(true)}
              style={imageLoading ? {} : { display: 'none' }}
              loading="lazy"
            />
          </div>
        </div>
        <div className="my-1">
          <div className="h-5 w-24">
            <StaticStar urate={rating} size={15} />
          </div>
        </div>
        <div className="flex flex-col h-38 w-full">
          <h2 className="font-bold text-xl">
            <NumericFormat
              value={price}
              displayType={'text'}
              thousandSeparator=","
              prefix={'$'}
              decimalScale={2}
              fixedDecimalScale
            />
          </h2>
          <h3 className="font-semibold text-l mb-3">{name}</h3>
          <div className="flex items-center bg-green-100 border border-black rounded-xl h-8 w-20 hover:cursor-pointer select-none">
            <h2 className="text-3xl mx-1">+</h2>
            <h3 className="text-sm">Cart</h3>
          </div>
          <p className="text-s font-thin">Stock left: {stock}</p>
        </div>
      </div>
    </div>
  );
};

export default Product;
