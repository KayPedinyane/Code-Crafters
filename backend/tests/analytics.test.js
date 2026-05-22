const request = require('supertest');
const express = require('express');
const analyticsRouter = require('../routes/analytics');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use('/analytics', analyticsRouter);

describe('Analytics Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /applications returns formatted analytics data', async () => {
    const mockData = [
      {
        id: 1,
        status: 'pending',
        applied_at: new Date(),
        opportunityTitle: 'Developer Role',
        opportunityType: 'Internship',
        sector: 'ICT',
        location: 'Johannesburg, Gauteng',
        closing_date: '2030-12-31',
        nqf_level: 'NQF 7',
      },
    ];

    db.query.mockImplementation((sql, callback) => {
      callback(null, mockData);
    });

    const res = await request(app).get('/analytics/applications');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].province).toBe('Gauteng');
    expect(res.body[0].opportunityStatus).toBe('open');
  });

  test('GET /applications handles unknown province', async () => {
    const mockData = [
      {
        id: 1,
        status: 'pending',
        location: null,
        closing_date: '2030-12-31',
      },
    ];

    db.query.mockImplementation((sql, callback) => {
      callback(null, mockData);
    });

    const res = await request(app).get('/analytics/applications');

    expect(res.status).toBe(200);
    expect(res.body[0].province).toBe('Unknown Province');
  });

  test('GET /applications marks closed opportunities', async () => {
    const mockData = [
      {
        id: 1,
        status: 'pending',
        closing_date: '2020-01-01', // Past date
      },
    ];

    db.query.mockImplementation((sql, callback) => {
      callback(null, mockData);
    });

    const res = await request(app).get('/analytics/applications');

    expect(res.status).toBe(200);
    expect(res.body[0].opportunityStatus).toBe('closed');
  });

  test('GET /applications handles database error', async () => {
    db.query.mockImplementation((sql, callback) => {
      callback(new Error('DB error'), null);
    });

    const res = await request(app).get('/analytics/applications');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Analytics failed');
  });

  test('GET /applications handles missing fields gracefully', async () => {
    const mockData = [
      {
        id: 1,
        // Most fields missing
      },
    ];

    db.query.mockImplementation((sql, callback) => {
      callback(null, mockData);
    });

    const res = await request(app).get('/analytics/applications');

    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe('pending');
    expect(res.body[0].sector).toBe('Unknown');
    expect(res.body[0].opportunityTitle).toBe('Unknown');
  });
});