import React from 'react';
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
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
import MyAccount from './pages/MyAccount.jsx';
import RatingPage from './pages/RatingPage.jsx';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import NotFound from './pages/components/NotFound.jsx';

const App = () => {
  return (
    <CartProvider>
      <RoutesWrapper />
    </CartProvider>
  );
};

const RoutesWrapper = () => {
  const location = useLocation();
  const noNavbarPaths = ['/mothegoat', '/checkout'];
  const shouldShowNavbar = !noNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/myaccount" element={<MyAccount />} />
          <Route path="/rating" element={<RatingPage />} />
        </Route>
        <Route path="/" element={<Hero />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
