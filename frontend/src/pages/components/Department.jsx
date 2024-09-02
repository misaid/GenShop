import React from 'react';
import { useNavigate } from 'react-router-dom';
const Department = () => {
  const navigate = useNavigate();
  const handleClick = Department => {
    // setSearchParams({ department: Department });
    navigate(`/shop?department=${Department}`);
  };
  return (
    <div className="sticky top-12 h-[800px] w-[300px]">
      <div className="max-h-[800px] w-full overflow-y-scroll overflow-x-hidden">
        <div className="flex flex-col w-full">
          <h2 className="text-2xl p-4 border-b border-black">Departments</h2>
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
              className="flex justify-between items-center p-4 border-b border-gray-300 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleClick(department)}
            >
              <h3 className="text-lg">{department}</h3>
              <span className="text-gray-500 text-2xl">{'>'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Department;
