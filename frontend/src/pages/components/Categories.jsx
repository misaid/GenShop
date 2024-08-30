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

const FormSchema = z.object({
  items: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one item.',
  }),
});

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page')) || 1;
  const departmentParam = searchParams.get('department') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortbyParam = searchParams.get('sortby') || 'new';
  const departmentArray = departmentParam ? departmentParam.split(',') : [];
  const categoryArray = categoryParam ? categoryParam.split(',') : [];

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(
        `/categories/${departmentParam}`
      );
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  //test
  const form = useForm();
  function CheckboxReactHookFormMultiple() {
    const { handleSubmit, register } = useForm({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        items: ['recents', 'home'],
      },
    });
  }

  function onSubmit(data) {
    console.log(data.categories);
    window.scrollTo(0, 0);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', data.categories.join(','));
    setSearchParams(newParams);
  }

  //
  useEffect(() => {
    if (departmentParam) {
      form.reset();
      fetchCategories();
    }
  }, [departmentParam]);

  return (
    <div className="bg-sky-200 w-[300px] h-[800px]">
      <div className="p-4 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Categories</FormLabel>
                    <FormDescription>
                      Select the categories you want to display.
                    </FormDescription>
                  </div>
                  {categories.map(category => (
                    <FormField
                      key={category.categoryName}
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem
                          key={category.categoryName}
                          className="flex flex-row items-start space-x-3 space-y-0"
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
                          <FormLabel className="font-normal">
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
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Categories;
