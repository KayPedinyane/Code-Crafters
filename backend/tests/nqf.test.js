const request = require('supertest');
const express = require('express');
const nqfRouter = require('../routes/nqf');

const app = express();
app.use(express.json());
app.use('/nqf', nqfRouter);

describe('NQF Routes', () => {
  test('GET / returns NQF data', async () => {
    const res = await request(app).get('/nqf');
    
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  test('GET / returns JSON content type', async () => {
    const res = await request(app).get('/nqf');
    
    expect(res.headers['content-type']).toMatch(/json/);
  });
});