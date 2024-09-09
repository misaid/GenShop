import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Hero from './pages/Hero.jsx';
import Shop from './pages/Shop.jsx';
import About from './pages/About.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/LoginRegister.jsx';
import Generate from './pages/Generate.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Navbar from './pages/components/Navbar.jsx';
import Orders from './pages/Orders.jsx';
import { CartProvider } from './context/CartContext';

const App = () => {
  const location = useLocation();
  const noNavbarPaths = ['/login', '/checkout'];
  const shouldShowNavbar = !noNavbarPaths.includes(location.pathname);
  return (
    <CartProvider>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<div>Checkout</div>} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </CartProvider>
  );
};

export default App;
