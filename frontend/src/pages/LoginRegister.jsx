import React from "react";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <div className="flex-1 w-1/2 h-screen bg-gradient-to-r from-lime-400 to-green-600">
          <h2 className="text-3xl text-white font-bold pt-20 pl-10">
            Login or Register for [E-commerce Placeholder Name]
          </h2>
          <p className="text-white text-lg pl-10 mt-5">
            Welcome to [E-commerce Placeholder Name], the best place to buy
            fruits online. Login or register to get started.
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Tabs defaultValue="login" className="w-[400px]">
            <TabsList className="">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <div className="mt-4 px-3 pb-3 border border-solid rounded-xl">
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
