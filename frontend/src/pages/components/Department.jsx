// External imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Department component used in the shop page
 * This component is a sidebar used to filter products by department
 * @returns {JSX.Element} - Department
 * */
export default function Department() {
  const navigate = useNavigate();
  const handleClick = Department => {
    navigate(`/shop?department=${Department}`);
  };

  return (
    <div className="max-h-[706px] w-[300px] bg-background border border-grey-200 shadow-sm rounded-r-xl">
      <div className=" w-full overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col w-full">
          <h2 className="text-2xl font-bold p-4 border-b border-grey-200">
            Departments
          </h2>
          {[
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
          ].map(department => (
            <div
              key={department}
              className="flex justify-between items-center p-4 border-b border-grey-200 hover:bg-muted cursor-pointer"
              onClick={() => handleClick(department)}
            >
              <h3 className="text-lg font-medium">{department}</h3>
              <span className="text-muted-foreground text-2xl ml-2">
                <div className="w-6 h-6"> &gt; </div>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
