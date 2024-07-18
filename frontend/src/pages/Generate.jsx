import axios from "axios";
import Navbar from "./components/Navbar";
import { useState } from "react";
//zod 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
//form
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { redirect, useNavigate, useParams } from "react-router-dom";

const Generate = () => {
  const [completion, setCompletion] = useState([]);
  const [imageURL, setImageURL] = useState([]);
  const FormSchema = z.object({
    prompt: z.string().min(2, {
      message: "Prompt must be at least 2 characters.",
    }),
  })
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      const response = await axiosInstance.post('/generate',
        {
          prompt: values.prompt,
        }, { withCredentials: true })
      //console.log(response);
      setCompletion(response.data.item);
      setImageURL(response.data.image);
      console.log(response.data.item);
      //navigate('/shop');
    } catch (error) {
      console.log(error);
    }
  };
  const form = useForm({ resolver: zodResolver(FormSchema), });

  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center ">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
      <h2 className="bg-red-100">{completion}</h2>
      <img src={`data:image/jpeg;base64,${imageURL}`} />
    </div>
  );
};
export default Generate;
