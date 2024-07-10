import React from "react";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";

const Login = () => {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center mt-10">
        <div className="bg-green-300 rounded-xl p-10 h-[400px] w-[500px]">
            <h2 className="text-2xl font- mb-2">Login/Signup</h2>
            <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
