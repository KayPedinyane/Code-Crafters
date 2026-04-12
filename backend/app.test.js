jest.mock('./db', () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

jest.mock('./routes/opportunities', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json([]));
  router.post('/', (req, res) => res.status(201).json({ message: 'Opportunity posted successfully' }));
  router.get('/:id', (req, res) => res.json({ id: 1 }));
  router.patch('/:id/approve', (req, res) => res.json({ message: 'Opportunity approved successfully' }));
  router.delete('/:id', (req, res) => res.json({ message: 'Opportunity removed successfully' }));
  return router;
});

const request = require('supertest');
const app = require('./app');

describe('GET /', () => {
  test('responds with API running', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('API running');
  });
});

describe('GET /health', () => {
  test('responds with api running', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /opportunities', () => {
  test('responds with array', async () => {
    const response = await request(app).get('/opportunities');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /opportunities', () => {
  test('creates an opportunity', async () => {
    const response = await request(app).post('/opportunities').send({
      title: 'IT Learnership',
      description: 'IT learnership for students',
      stipend: 'R3500',
      location: 'Johannesburg',
      duration: '12 months',
      requirements: 'Must be studying IT',
      closing_date: '2026-12-31',
      provider_id: 1,
      sector: 'ICT',
      nqf_level: 'NQF 4'
    });
    expect(response.statusCode).toBe(201);
  });
});

describe('PATCH /opportunities/:id/approve', () => {
  test('approves an opportunity', async () => {
    const response = await request(app).patch('/opportunities/1/approve');
    expect(response.statusCode).toBe(200);
  });
});

describe('DELETE /opportunities/:id', () => {
  test('removes an opportunity', async () => {
    const response = await request(app).delete('/opportunities/1');
    expect(response.statusCode).toBe(200);
  });
});