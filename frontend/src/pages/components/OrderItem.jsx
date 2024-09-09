import React from 'react';

const OrderItem = ({ order, orderItems }) => {
  console.log(orderItems.product);
  // response.data = { totalOrders, totalPages, orderInfo }
  // order =  { order: {order}, orderItems: [{product, quantity}] }
  // orderItems { product, quantity }
  // order { orderNumber, userid, orderItems, shippingAddress, paymentInfo, total, status }
  //
  const customerOrder = order.order;
  return (
    <div>
      {/* {orderItems.map(item => ( */}
      {/*   <div> */}
      {/*     <div> */}
      {/*       <img src={item.product.image} alt={item.product.name} /> */}
      {/*     </div> */}
      {/*     <div> */}
      {/*       <h3>{item.product.name}</h3> */}
      {/*       <p>{item.product.description}</p> */}
      {/*       <p>{item.product.price}</p> */}
      {/*       <p>{item.quantity}</p> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* ))} */}
    </div>
  );
};

export default OrderItem;
