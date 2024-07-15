import React from "react";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center mt-10 ">
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
  );
};

export default Login;
