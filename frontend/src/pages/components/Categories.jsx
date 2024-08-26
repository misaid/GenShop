import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const department = searchParams.get('department');

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`/categories/${department}`);
      setCategories(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (department) {
      fetchCategories();
    }
  }, [department]);

  return (
    <div className="bg-sky-200 w-[300px] h-[800px]">
      <div>
        {categories.map(category => (
          <div key={category.categoryName} className="bg-red-50 ">
            <p>
              {category.categoryName} {category.len}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
