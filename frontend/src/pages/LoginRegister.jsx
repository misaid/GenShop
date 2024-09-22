import React from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  return (
    <div>
      <div className="flex w-full h-[600px] md:h-[800px] justify-center items-cneter">
        <div className="flex flex-1 items-center justify-center">
          <Tabs defaultValue="login" className=" w-[300px] mobile:w-[400px]">
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
