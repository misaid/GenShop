import request from 'supertest';
import mongoose from 'mongoose';
import app, { app as exportedApp } from '../index.js';
import { Product } from '../models/index.js';

const serverApp = exportedApp || app;

describe('Products listing', () => {
  beforeEach(async () => {
    // seed a few products
    await Product.create([
      {
        name: 'Alpha',
        price: 10,
        image: 'http://img/1.webp',
        countInStock: 10,
        description: 'Alpha desc',
        department: 'Electronics',
        categories: ['Phones'],
        flag: 'moderated',
      },
      {
        name: 'Beta',
        price: 20,
        image: 'http://img/2.webp',
        countInStock: 5,
        description: 'Beta desc',
        department: 'Electronics',
        categories: ['Laptops'],
        flag: 'moderated',
      },
      {
        name: 'Gamma',
        price: 30,
        image: 'http://img/3.webp',
        countInStock: 2,
        description: 'Gamma desc',
        department: 'Books and Media',
        categories: ['Books'],
        flag: 'unmoderated',
      },
    ]);
  });

  it('paginates and sorts products, ignoring unmoderated by default', async () => {
    const res = await request(serverApp)
      .post('/products')
      .send({ page: 1, category: [], department: [], sortType: 'priceAsc' });
    expect(res.status).toBe(200);
    const { products, totalPages, totalProducts } = res.body;
    expect(totalProducts).toBe(2);
    expect(products[0].name).toBe('Alpha');
    expect(products[1].name).toBe('Beta');
  });

  it('fetches single product by id', async () => {
    const all = await Product.find({ flag: 'moderated' });
    const res = await request(serverApp).get(`/product/${all[0]._id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(String(all[0]._id));
  });
});
