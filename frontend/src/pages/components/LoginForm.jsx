import axios from "axios";
import { redirect, useNavigate, useParams } from "react-router-dom";
// form imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
// Tab imports 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
const formSchema = z.object({
  name: z.string().min(1, "Username is required"),
  // TODO: hard to crack password with special characters
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "", password: ""
    },
  });
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
  });
  const navigate = useNavigate();

  async function onSubmit(values) {
    console.log(values.name);
    console.log(import.meta.env.VITE_APP_API_URL);
    try {
      const response = await axiosInstance.post('/login',
        {
          username: values.name,
          password: values.password
        }, { withCredentials: true })
      console.log(response);
      navigate('/shop');
    } catch (error) {
      console.log(error);
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
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
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
