import request from 'supertest';
import app, { app as exportedApp } from '../index.js';
import { Product, User } from '../models/index.js';

const serverApp = exportedApp || app;

describe('Moderation endpoints', () => {
  it('requires staff to moderate a product', async () => {
    const product = await Product.create({
      name: 'ToModerate',
      price: 99,
      image: 'http://img/mod.webp',
      countInStock: 1,
      description: 'Moderate me',
      department: 'Electronics',
      categories: ['Gadgets'],
      flag: 'unmoderated',
    });

    // Non-staff user cannot moderate
    const nonStaff = request.agent(serverApp);
    await nonStaff
      .post('/register')
      .send({ username: 'NonStaff', password: 'abc12345' });
    const res1 = await nonStaff.post(`/moderate/${product._id}`).send();
    expect(res1.status).toBe(401);

    // Make a staff user directly and login
    const staffAgent = request.agent(serverApp);
    await staffAgent
      .post('/register')
      .send({ username: 'Admin', password: 'abc12345' });

    const staffUser = await User.findOne({ username: 'admin' });
    staffUser.staff = true;
    await staffUser.save();

    const res2 = await staffAgent.post(`/moderate/${product._id}`).send();
    expect(res2.status).toBe(200);
  });
});
