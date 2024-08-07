import { NumericFormat } from "react-number-format";

const Product = ({ name, rating, stock, price, imageURL }) => {
  return (
    <div className="bg-red-100 h-[450px] w-[275px] border border-black rounded-xl overflow-hidden">
      <div className="mx-3">
        <div className="flex flex-col items-center ">
          <div className="">
            <img
              className="max-h-[270px] max-w-[300px] rounded-xl "
              src={`data:image/jpeg;base64,${imageURL}`}
              alt="product"
              loading="lazy"
            />
          </div>
        </div>
        <div className="my-1">
          <div className="bg-green-100 h-5 w-24"> </div>
        </div>
        <div className="flex flex-col  bg-blue-100 h-38 w-full">
          <h2 className="font-bold text-xl">
            <NumericFormat
              value={price}
              displayType={"text"}
              thousandSeparator=","
              prefix={"$"}
              decimalScale={2}
              fixedDecimalScale
            />
          </h2>
          <h3 className="font-semibold text-l mb-3">{name}</h3>
          <div className="flex items-center bg-green-200 border border-black rounded-xl h-8 w-20 hover:cursor-grab select-none">
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
