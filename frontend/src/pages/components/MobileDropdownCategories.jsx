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

  const [selectedDept, setSelectedDept] = useState(departmentParam);
  const handleDeptChange = Dept => {
    setSelectedDept(Dept);
  };

  const [selectedFilters, setSelectedFilters] = useState('');
  const handleFilterChange = filterId => {
    setSelectedFilters(prev => {
      const newFilters = prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId];
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

  const departments = [
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

  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(
        `/categories/${departmentParam}`
      );
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
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

    if (selectedDept) {
      newParams.delete('category');
      newParams.set('department', selectedDept);
      newParams.delete('page');
    } else {
      newParams.delete('department');
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
    setSelectedFilters(
      defaultCategories ? defaultCategories.split(',').filter(Boolean) : []
    );
    fetchCategories();
  }, [departmentParam, defaultCategories]);

  return loading ? null : (
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
          <Accordion type="single" collapsible className="w-full">
            {departmentParam &&
              filterCategories.map(category => (
                <AccordionItem value={category.id} key={category.id}>
                  <AccordionTrigger>{category.label}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2 overflow-auto max-h-60">
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
            <AccordionItem value="Departments">
              <AccordionTrigger>Departments</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {departments.map(dept => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox
                        id={dept}
                        checked={selectedDept === dept}
                        onCheckedChange={() => handleDeptChange(dept)}
                      />
                      <Label htmlFor={dept}>{dept}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFilters([]);
                setCategoriesArray([]);
                setSelectedDept('');
                setSelectedOption('new');
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
