import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
//Checkbox Form Components
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const form = useForm();
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  const departmentParam = searchParams.get('department') || '';
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

  const onSubmit = data => {
    console.log(data.categories);
    window.scrollTo(0, 0);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    newParams.set('category', data.categories.join(','));
    setSearchParams(newParams);
  };

  useEffect(() => {
    if (departmentParam) {
      form.reset();
      fetchCategories();
    }
  }, [departmentParam]);

  return !loading ? (
    <div className="h-[800px] w-[300px]">
      <div className="w-full overflow-y-scroll overflow-x-hidden shadow-md rounded-xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <div className="mb-4 border-grey-300 border-b border-3 w-full">
                    <div className="p-4">
                      <FormLabel className="text-2xl">
                        {departmentParam}
                      </FormLabel>
                      <FormDescription>
                        Select one or more categories to query from the list
                        below.
                      </FormDescription>
                    </div>
                  </div>
                  {categories.map(category => (
                    <FormField
                      key={category.categoryName}
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem
                          key={category.categoryName}
                          className="flex flex-row items-start space-x-3 space-y-0 px-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field?.value?.includes(
                                category.categoryName
                              )}
                              onCheckedChange={checked => {
                                console.log('checked', category.categoryName);
                                return checked
                                  ? field?.onChange([
                                      ...(field.value || []),
                                      category.categoryName,
                                    ])
                                  : field?.onChange(
                                      field?.value?.filter(
                                        value => value !== category.categoryName
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-l">
                            {category.categoryName} ({category.len})
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="p-4 border-grey-300 border-t border-3">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  ) : (
    // TODO:
    <div className="w-[300px]"></div>
  );
};

export default Categories;
