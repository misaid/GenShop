import React from "react";
import Navbar from "./components/Navbar";
import { Link } from "react-router-dom";
import Pear from "../assets/pear.png";
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/shop");
  };
  return (
    <>
      <Navbar />
      <div className="flex">
        <div className="flex-1 mx-auto">
          <h1 className="text-4xl font-bold ">We sell fruits </h1>
          <p className="text-2xl">Fresh fruits at your doorstep</p>
          <Button variant="outline" onClick={handleClick}> Shop Now</Button>
        </div>
        <div className="flex-1">
          <img
            src={Pear}
            alt="hero"
            className="mt-8"
          />
        </div>
      </div>
    </>
  );
};

export default Hero;
