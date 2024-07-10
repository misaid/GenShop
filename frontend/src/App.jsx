import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Hero from './pages/Hero.jsx'
import Shop from './pages/Shop.jsx'
import About from './pages/About.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Hero />} />
      <Route path='/shop' element={<Shop  />} />
      <Route path='/about' element={<About />} />
      <Route path='/cart' element={<Cart />} />
      <Route path='/login' element={<Login />}/>
      <Route path='/checkout' element={<div>Checkout</div>} />
      <Route path='/p/:id' element={<div>Product</div>} />
    </Routes>
  )
}

export default App