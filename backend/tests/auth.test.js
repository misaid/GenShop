import request from 'supertest';
import mongoose from 'mongoose';
import app, { app as exportedApp } from '../index.js';

// Use the exported express app
const serverApp = exportedApp || app;

describe('Auth endpoints', () => {
  it('registers a user and sets jwt cookie', async () => {
    const res = await request(serverApp)
      .post('/register')
      .send({ username: 'Alice', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.text).toContain('User created');
    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.join(';')).toContain('jwt=');
  });

  it('logs in an existing user and returns cookie', async () => {
    await request(serverApp)
      .post('/register')
      .send({ username: 'Bob', password: 'pass1234' });

    const res = await request(serverApp)
      .post('/login')
      .send({ username: 'Bob', password: 'pass1234' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('User logged in');
    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.join(';')).toContain('jwt=');
  });

  it('rejects protected route without JWT', async () => {
    const res = await request(serverApp).get('/user');
    expect(res.status).toBe(403);
  });

  it('returns current username with valid JWT', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'Carol', password: 'abc12345' });
    const res = await agent.get('/user');
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('string');
    expect(res.body).toBe('carol');
  });

  it('logs out and clears cookie', async () => {
    const agent = request.agent(serverApp);
    await agent
      .post('/register')
      .send({ username: 'Dave', password: 'abc12345' });
    const res = await agent.post('/logout');
    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'] || [];
    // Clear cookie response should still include jwt clearing
    expect(setCookie.join(';')).toMatch(/jwt=|jwt=;/);
  });
});
