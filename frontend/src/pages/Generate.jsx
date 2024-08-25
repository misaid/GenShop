import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import axios from 'axios';
import Navbar from './components/Navbar';
import { useState, useRef } from 'react';
//zod
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
//form
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { redirect, useNavigate, useParams } from 'react-router-dom';
import Product from './components/Product';

const Generate = () => {
  const [product, setProduct] = useState([]);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const FormSchema = z.object({
    prompt: z.string().min(2, {
      message: 'Prompt must be at least 2 characters.',
    }),
  });
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const navigate = useNavigate();

  const progressInterval = () => {
    progressRef.current = 0;
    setProgress(progressRef.current);
    let start = Date.now();
    const duration = 30000; // 30 seconds

    const interval = setInterval(() => {
      if (progressRef.current === 100) {
        clearInterval(interval);
        return;
      }
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        clearInterval(interval);
        progressRef.current = 90;
        setProgress(progressRef.current);
      } else {
        const t = elapsed / duration;
        const eased = 1 - Math.pow(1 - t, 3); // ease out cubic function
        progressRef.current = eased * 90;
        setProgress(progressRef.current);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  };

  const onSubmit = async values => {
    try {
      if (loading) {
        toast.error(
          'Please wait for the current product to finish generating.'
        );
        return;
      }
      setLoading(true);
      progressInterval();
      const response = await axiosInstance.post(
        '/generate',
        {
          prompt: values.prompt,
        },
        { withCredentials: true }
      );
      //console.log(response);
      progressRef.current = 100;
      setProgress(progressRef.current);
      setProduct(response.data.product);
      setKey(key + 1);
      console.log(response.data.item);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  const form = useForm({ resolver: zodResolver(FormSchema) });

  return (
    <div>
      <Navbar />
      <Toaster richColors />
      <div className="flex flex-col justify-center items-center space-y-8 ">
        <Product product={product} key={key} />
        {!loading ? <></> : <Progress value={progress} className="w-64" />}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt for product</FormLabel>
                  <FormControl>
                    <Input placeholder="Solid Gold Apple" {...field} />
                  </FormControl>
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
export default Generate;
