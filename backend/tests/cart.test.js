import request from 'supertest';
import app, { app as exportedApp } from '../index.js';
import { Product } from '../models/index.js';

const serverApp = exportedApp || app;

describe('Cart operations', () => {
  it('adds an item to cart and then updates quantity', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'Eve', password: 'pass12345' });

    const product = await Product.create({
      name: 'Widget',
      price: 15,
      image: 'http://img/widget.webp',
      countInStock: 3,
      description: 'A widget',
      department: 'Electronics',
      categories: ['Gadgets'],
      flag: 'moderated',
    });

    // add
    const addRes = await agent
      .post('/cart')
      .send({ productId: product._id, quantity: 1, flag: 'add' });
    expect(addRes.status).toBe(200);

    // set quantity beyond stock; server caps to stock
    const setRes = await agent
      .post('/cart')
      .send({ productId: product._id, quantity: 10, flag: 'set' });
    expect([200, 400]).toContain(setRes.status);

    const getRes = await agent.get('/cart');
    expect(getRes.status).toBe(200);
    const item = getRes.body.cartInfo.find(
      i => i.product._id === String(product._id)
    );
    expect(item).toBeTruthy();
    expect(item.quantity).toBeLessThanOrEqual(3);
  });
});
