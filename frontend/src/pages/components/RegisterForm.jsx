// External imports
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { redirect, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

// Internal imports
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Define a schema for the form.
 * @property {string} name - the name of the user
 * @property {string} password - the password of the user
 * @property {string} matchPassword - the password of the user
 **/

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Username is required')
      .max(20, 'Username must be less than 20 characters)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    matchPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.matchPassword === data.password, {
    message: 'Passwords must match',
    path: ['matchPassword'],
  });

/**
 * The register form component.
 * Creates and returns the register form component.
 * @returns {JSX.Element} - The register form component.
 * */
export default function RegisterForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const navigate = useNavigate();
  const [usernameTaken, setUsernameTaken] = useState(false);

  /**
   * Define an axios instance.
   * @property {string} baseURL - the base URL for the axios instance
   **/
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });

  /**
   * Define a submit handler.
   * @param {Object} values - values from the form
   * @returns {void}
   **/
  async function onSubmit(values) {
    //console.log(values.password == values.matchPassword);
    try {
      const response = await axiosInstance.post(
        '/register',
        {
          username: values.name,
          password: values.password,
          //matchPassword: values.matchPassword
        },
        { withCredentials: true }
      );
      console.log(response);
      setUsernameTaken(false);
      navigate('/shop');
    } catch (error) {
      setUsernameTaken(true);
      console.log(error.response.data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="Create a username"
                  {...field}
                  onChange={e => {
                    setUsernameTaken(false);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {usernameTaken && (
          <Alert variant="destructive">
            <AlertDescription>
              This username is already taken. Please choose another.
            </AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  type="password"
                  placeholder="Create a password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="matchPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  type="password"
                  placeholder="Confirm your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
