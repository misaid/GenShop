import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// Dropdown Form
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SlidersHorizontal } from 'lucide-react';

const MobileDropdownCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const departmentParam = searchParams.get('department') || '';
  const defaultCategories = searchParams.get('category') || '';
  const [categoriesArray, setCategoriesArray] = useState([]);

  const sortByParam = searchParams.get('sortby') || 'new';

  const [selectedOption, setSelectedOption] = useState(sortByParam);
  const handleOptionChange = optionId => {
    setSelectedOption(optionId);
  };

  const [selectedFilters, setSelectedFilters] = useState('');
  const handleFilterChange = filterId => {
    setSelectedFilters(prev => {
      const newFilters = prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId];
      console.log('Filter changes:', newFilters);
      return newFilters;
    });
  };
  const filterOptions = [
    { id: 'new', label: 'New Arrivals' },
    { id: 'priceDesc', label: 'Price: High to Low' },
    { id: 'priceAsc', label: 'Price: Low to High' },
    { id: 'ratingDesc', label: 'Rating: High to Low' },
    { id: 'ratingAsc', label: 'Rating: Low to High' },
  ];

  const filterCategories = [
    {
      id: 'categories',
      label: 'Categories',
      subcategories: categories.map(category => {
        return {
          id: category.categoryName,
          label: category.categoryName,
        };
      }),
    },
  ];

  console.log('Selected Filters:', filterCategories);

  const [loading, setLoading] = useState(true);

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
    console.log('Apply Filters');
    setOpen(false);
    window.scrollTo(0, 0);
    //map selected filters into a list

    const newParams = new URLSearchParams(searchParams);

    if (selectedOption) {
      newParams.set('sortby', selectedOption);
      newParams.delete('page');
    } else {
      newParams.delete('sortby');
    }

    if (selectedFilters.length > 0) {
      newParams.set('category', selectedFilters.join(','));
      newParams.delete('page');
    } else {
      newParams.delete('category');
    }

    setSearchParams(newParams);
  };

  useEffect(() => {
    // If params change reset form
    setSelectedFilters(defaultCategories.split(','));
    fetchCategories();
  }, [departmentParam, defaultCategories]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters{' '}
          {selectedFilters.length === 0
            ? `(${categoriesArray.length})`
            : `(${selectedFilters.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <h3 className="font-medium leading-none">Filter Options</h3>

          <div className="grid gap-2">
            {filterOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedOption === option.id}
                  onCheckedChange={() => handleOptionChange(option.id)}
                />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </div>
          {departmentParam && (
            <Accordion type="multiple" className="w-full">
              {filterCategories.map(category => (
                <AccordionItem value={category.id} key={category.id}>
                  <AccordionTrigger>{category.label}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2">
                      {category.subcategories.map(subcategory => (
                        <div
                          key={subcategory.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={subcategory.id}
                            checked={selectedFilters.includes(subcategory.id)}
                            onCheckedChange={() =>
                              handleFilterChange(subcategory.id)
                            }
                          />
                          <Label htmlFor={subcategory.id}>
                            {subcategory.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFilters([]);
                setCategoriesArray([]);
                // setOpen(false);
              }}
            >
              Clear All
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MobileDropdownCategories;
