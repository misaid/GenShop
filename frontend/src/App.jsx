import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Hero from './pages/Hero.jsx';
import Shop from './pages/Shop.jsx';
import About from './pages/About.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/LoginRegister.jsx';
import Generate from './pages/Generate.jsx';
import ProductPage from './pages/ProductPage.jsx';
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/about" element={<About />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/checkout" element={<div>Checkout</div>} />
      <Route path="/generate" element={<Generate />} />
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  );
};

export default App;
