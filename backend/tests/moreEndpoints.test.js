import request from 'supertest';
import mongoose from 'mongoose';
import app, { app as exportedApp } from '../index.js';
import {
  User,
  Product,
  Department,
  Category,
  Order,
  Cart,
} from '../models/index.js';

const serverApp = exportedApp || app;

describe('Misc backend endpoints', () => {
  it('GET / returns health string', async () => {
    const res = await request(serverApp).get('/');
    expect(res.status).toBe(234);
    expect(res.text).toContain('MSAID');
  });

  it('GET /failure_url redirects to shop cart', async () => {
    const res = await request(serverApp).get('/failure_url').redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/cart$/);
  });
});

describe('Categories endpoint', () => {
  it('returns categories for department with lengths', async () => {
    const dept = await Department.create({
      departmentName: 'Electronics',
      categories: [],
      products: [],
    });
    const product = await Product.create({
      name: 'Phone',
      price: 100,
      image: 'http://img/p.webp',
      countInStock: 3,
      description: 'desc',
      department: 'Electronics',
      categories: ['Phones'],
      flag: 'moderated',
    });
    const cat = await Category.create({
      categoryName: 'Phones',
      department: dept._id,
      products: [product._id],
    });
    dept.categories.push(cat._id);
    dept.products.push(product._id);
    await dept.save();

    const res = await request(serverApp).get('/categories/Electronics');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual({ categoryName: 'Phones', len: 1 });
  });
});

describe('Orders and rating endpoints', () => {
  it('lists orders with product enrichment', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'OrderUser', password: 'password1' });
    const user = await User.findOne({ username: 'orderuser' });

    const product = await Product.create({
      name: 'ItemOne',
      price: 25,
      image: 'http://img/i.webp',
      countInStock: 10,
      description: 'desc',
      department: 'Electronics',
      categories: ['Phones'],
      flag: 'moderated',
    });

    const order = await Order.create({
      orderNumber: 1,
      userid: user._id,
      orderItems: [{ productId: product._id, quantity: 2 }],
      shippingAddress: {
        address: 'a',
        city: 'c',
        postalCode: 'p',
        country: 'US',
      },
      paymentInfo: 4242,
      total: 50,
      status: 'Processing',
    });
    user.orderids.push(order._id);
    await user.save();

    const res = await agent.post('/orders').send({ page: 1 });
    expect(res.status).toBe(200);
    expect(res.body.totalOrders).toBe(1);
    expect(res.body.fullOrder[0].products[0]._id).toBe(String(product._id));
  });

  it('getrating returns 400 on invalid page', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'RateUser', password: 'password1' });
    const res = await agent.post('/getrating').send({ page: 100 });
    expect(res.status).toBe(400);
  });

  it('addrating rejects when product never ordered', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'Rater', password: 'password1' });
    const product = await Product.create({
      name: 'NotOrdered',
      price: 5,
      image: 'http://img/n.webp',
      countInStock: 1,
      description: 'desc',
      department: 'Books and Media',
      categories: ['Books'],
      flag: 'moderated',
    });
    const res = await agent
      .post('/addrating')
      .send({ productId: product._id, rating: 5 });
    expect(res.status).toBe(400);
  });

  it('addrating sets rating and updates average when ordered', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'Rater2', password: 'password1' });
    const user = await User.findOne({ username: 'rater2' });
    const product = await Product.create({
      name: 'Ordered',
      price: 5,
      image: 'http://img/o.webp',
      countInStock: 2,
      description: 'desc',
      department: 'Books and Media',
      categories: ['Books'],
      flag: 'moderated',
    });
    const order = await Order.create({
      orderNumber: 2,
      userid: user._id,
      orderItems: [{ productId: product._id, quantity: 1 }],
      shippingAddress: {
        address: 'a',
        city: 'c',
        postalCode: 'p',
        country: 'US',
      },
      paymentInfo: 4242,
      total: 5,
      status: 'Processing',
    });
    user.orderids.push(order._id);
    await user.save();

    const res = await agent
      .post('/addrating')
      .send({ productId: product._id, rating: 4 });
    expect(res.status).toBe(200);

    const updated = await Product.findById(product._id);
    expect(updated.averageRating).toBeGreaterThan(0);
    expect(updated.rating.get(user._id.toString())).toBe(4);
  });
});

describe('Delete user', () => {
  it('rejects invalid password', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'DeleteUser', password: 'secretpass' });
    const res = await agent
      .post('/delete_user')
      .send({ password: 'wrongpass' });
    expect(res.status).toBe(400);
  });

  it('deletes user data on valid password', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'DeleteOk', password: 'secretpass' });
    const user = await User.findOne({ username: 'deleteok' });

    // Seed order & product and rating to be removed
    const product = await Product.create({
      name: 'DelProd',
      price: 9,
      image: 'http://img/d.webp',
      countInStock: 4,
      description: 'desc',
      department: 'Electronics',
      categories: ['Phones'],
      flag: 'moderated',
    });
    const order = await Order.create({
      orderNumber: 3,
      userid: user._id,
      orderItems: [{ productId: product._id, quantity: 1 }],
      shippingAddress: {
        address: 'a',
        city: 'c',
        postalCode: 'p',
        country: 'US',
      },
      paymentInfo: 4242,
      total: 9,
      status: 'Processing',
    });
    user.orderids.push(order._id);
    await user.save();

    // Put a rating by user to ensure deletion logic runs
    product.rating = new Map([[user._id.toString(), 5]]);
    product.averageRating = 5;
    await product.save();

    const res = await agent
      .post('/delete_user')
      .send({ password: 'secretpass' });
    expect(res.status).toBe(200);

    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeNull();
  });
});

describe('Products and cart negative paths', () => {
  it('products returns 400 when category intersection is empty', async () => {
    const dept = await Department.create({
      departmentName: 'Home and Garden',
      categories: [],
      products: [],
    });
    const cat1 = await Category.create({
      categoryName: 'Garden',
      department: dept._id,
      products: [],
    });
    const cat2 = await Category.create({
      categoryName: 'Kitchen',
      department: dept._id,
      products: [],
    });
    dept.categories.push(cat1._id, cat2._id);
    await dept.save();

    const res = await request(serverApp)
      .post('/products')
      .send({
        page: 1,
        category: ['Garden', 'Kitchen'],
        department: ['Home and Garden'],
        sortType: 'new',
      });
    expect(res.status).toBe(400);
  });

  it('cart returns errors for invalid flag and missing product', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'CartUser', password: 'passpass1' });

    const badFlag = await agent
      .post('/cart')
      .send({
        productId: new mongoose.Types.ObjectId(),
        quantity: 1,
        flag: 'bad',
      });
    expect(badFlag.status).toBe(400);

    const unknownProduct = await agent
      .post('/cart')
      .send({
        productId: new mongoose.Types.ObjectId(),
        quantity: 1,
        flag: 'add',
      });
    expect(unknownProduct.status).toBe(400);
  });

  it('can add then delete from cart', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'CartUser2', password: 'passpass1' });
    const product = await Product.create({
      name: 'CartDel',
      price: 12,
      image: 'http://img/x.webp',
      countInStock: 5,
      description: 'desc',
      department: 'Electronics',
      categories: ['Phones'],
      flag: 'moderated',
    });

    const addRes = await agent
      .post('/cart')
      .send({ productId: product._id, quantity: 1, flag: 'add' });
    expect(addRes.status).toBe(200);

    const delRes = await agent
      .post('/cart')
      .send({ productId: product._id, flag: 'delete' });
    expect(delRes.status).toBe(200);
  });
});

describe('Moderation endpoints (GET and deleteProduct)', () => {
  it('GET /moderate returns unmoderated products paginated', async () => {
    await Product.create({
      name: 'Unmod1',
      price: 10,
      image: 'http://img/u1.webp',
      countInStock: 1,
      description: 'd',
      department: 'Electronics',
      categories: ['Phones'],
      flag: 'unmoderated',
    });
    const res = await request(serverApp).get('/moderate?page=1');
    expect(res.status).toBe(200);
    expect(res.body.totalProducts).toBeGreaterThanOrEqual(1);
  });

  it('deleteProduct requires staff and deletes relations', async () => {
    const dept = await Department.create({
      departmentName: 'Office Supplies',
      categories: [],
      products: [],
    });
    const product = await Product.create({
      name: 'Paper',
      price: 2,
      image: 'http://img/p.webp',
      countInStock: 100,
      description: 'd',
      department: 'Office Supplies',
      categories: ['Paper'],
      flag: 'moderated',
    });
    const cat = await Category.create({
      categoryName: 'Paper',
      department: dept._id,
      products: [product._id],
    });
    dept.categories.push(cat._id);
    dept.products.push(product._id);
    await dept.save();

    const nonStaff = request.agent(serverApp);
    await nonStaff
      .post('/register')
      .send({ username: 'emp', password: 'password1' });
    const r1 = await nonStaff.post(`/deleteProduct/${product._id}`).send();
    expect(r1.status).toBe(401);

    const staffAgent = request.agent(serverApp);
    await staffAgent
      .post('/register')
      .send({ username: 'boss', password: 'password1' });
    const staff = await User.findOne({ username: 'boss' });
    staff.staff = true;
    await staff.save();

    const r2 = await staffAgent.post(`/deleteProduct/${product._id}`).send();
    expect(r2.status).toBe(200);

    const prodGone = await Product.findById(product._id);
    expect(prodGone).toBeNull();
  });
});
