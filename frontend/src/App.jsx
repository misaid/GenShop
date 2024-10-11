// External Import
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
// Internal Import
import {
  Hero,
  Shop,
  Cart,
  Login,
  Generate,
  ProductPage,
  Orders,
  MyAccount,
  RatingPage,
} from './pages';
import { CartProvider } from './context/CartContext';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import { Navbar, NotFound } from './pages/components';

export default function App() {
  return (
    <CartProvider>
      <RoutesWrapper />
    </CartProvider>
  );
}

const RoutesWrapper = () => {
  const location = useLocation();
  const noNavbarPaths = ['/checkout'];
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
        <Route path="/login" element={<Login />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};
