// External imports
import axios from 'axios';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Internal imports
import { Toaster } from '@/components/ui/sonner';
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
import { Product } from './components';
import Confetti from '@/components/ui/confetti';
/**
 * Generate page component
 * this page allows the user to generate a product using a prompt
 * @returns {JSX.Element} - Generate page component
 */
export default function Generate() {
  const [product, setProduct] = useState([]);
  const [firstLoad, setFirstLoad] = useState(false);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const confettiRef = useRef(null);
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
      setFirstLoad(true);
      progressInterval();
      const response = await axiosInstance.post(
        '/generate',
        {
          prompt: values.prompt,
        },
        { withCredentials: true }
      );
      progressRef.current = 100;
      setProgress(progressRef.current);
      setProduct(response.data.product);
      setKey(key + 1);
      setLoading(false);
      console.log(response.data.item);
    } catch (error) {
      console.log(error);
    }
  };
  const form = useForm({ resolver: zodResolver(FormSchema) });

  return (
    <div>
      <Toaster richColors />

      <div className="flex flex-col justify-center mb-24 items-center mt-12">
        <div
          className={`mb-8 ${progressRef.current > 65 && progressRef.current < 100 ? 'animate-wiggle animate-infinite animate-duration-1000 animate-ease-linear' : ''}`}
        >
          <Product product={product} key={key} />
          {progressRef.current === 100 && (
            <Confetti
              ref={confettiRef}
              className="absolute left-0 top-0 z-0 size-full"
              onMouseEnter={() => {
                confettiRef.current?.fire({});
              }}
            />
          )}
        </div>
        {!firstLoad ? (
          <></>
        ) : (
          <Progress
            value={progress}
            className="w-64 animate-in fade-in zoom-in mb-4"
          />
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt for product</FormLabel>
                  <FormControl>
                    <Input
                      className="text-base"
                      placeholder="Solid Gold Apple"
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
      </div>
    </div>
  );
}
