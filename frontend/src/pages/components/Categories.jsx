// External imports
import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Interal imports
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * Categories component used in the shop page
 * This component is a sidebar used to filter products by category
 * @returns {JSX.Element} - Categories
 */
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const departmentParam = searchParams.get('department') || '';
  const defaultCategories = searchParams.get('category') || '';

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const handleFilterChange = filterId => {
    setSelectedFilters(prev => {
      const newFilters = prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId];
      return newFilters;
    });
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(
        `/categories/${departmentParam}`
      );
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleApplyFilters = () => {
    window.scrollTo(0, 0);
    const newParams = new URLSearchParams(searchParams);

    newParams.delete('page');
    newParams.delete('item');

    if (selectedFilters.length > 0) {
      newParams.set('category', selectedFilters.join(','));
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    // If department changes, reset form
    setSelectedFilters(
      defaultCategories ? defaultCategories.split(',').filter(Boolean) : []
    );
    if (departmentParam) {
      fetchCategories();
    }
  }, [departmentParam, defaultCategories]);

  return !loading ? (
    <div className="h-[800px] w-[300px]">
      <div className="w-full overflow-y-auto overflow-x-hidden border border-grey-200 shadow-sm rounded-r-xl">
        <div className="w-full h-full border-b border-grey-200 p-4">
          <h2 className="font-medium text-2xl ">{departmentParam}</h2>
          <h3 className="text-muted-foreground text-sm">
            Select one or more categories to query from the list below.
          </h3>
        </div>
        <div className="w-full h-full p-4 flex-row space-y-2">
          {categories.map(category => (
            <div
              key={category.categoryName}
              className="flex flex-row items-center space-x-3 text-sm"
            >
              <Checkbox
                id={category.categoryName}
                checked={selectedFilters.includes(category.categoryName)}
                onCheckedChange={() =>
                  handleFilterChange(category.categoryName)
                }
              />
              <Label
                htmlFor={category.categoryName}
                className="font-normal text-black"
              >
                {category.categoryName} ({category.len})
              </Label>
            </div>
          ))}
        </div>

        <div className="p-4 border-grey-300 border-t border-3 flex justify-between">
          <Button onClick={handleApplyFilters}>Submit</Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFilters([]);
            }}
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-[300px]"></div>
  );
}
