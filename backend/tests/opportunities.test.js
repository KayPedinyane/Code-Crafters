const request = require('supertest');
const express = require('express');
const opportunitiesRouter = require('../routes/opportunities');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use('/opportunities', opportunitiesRouter);

describe('Opportunities Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    test('creates opportunity successfully', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { insertId: 1 });
      });

      const res = await request(app)
        .post('/opportunities')
        .send({
          title: 'Software Developer',
          opportunity_type: 'Internship',
          description: 'Great opportunity',
          stipend: 5000,
          location: 'Johannesburg, Gauteng',
          duration: '12 months',
          requirements: 'Matric certificate',
          closing_date: '2030-12-31',
          provider_id: 1,
          sector: 'ICT',
          nqf_level: 'NQF 7',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 1);
      expect(db.query).toHaveBeenCalled();
    });

    test('returns 400 when required fields missing', async () => {
      const res = await request(app)
        .post('/opportunities')
        .send({
          title: 'Software Developer',
          // missing other required fields
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app)
        .post('/opportunities')
        .send({
          title: 'Software Developer',
          opportunity_type: 'Internship',
          description: 'Great opportunity',
          stipend: 5000,
          location: 'Johannesburg',
          duration: '12 months',
          requirements: 'Matric',
          closing_date: '2030-12-31',
          provider_id: 1,
          sector: 'ICT',
          nqf_level: 'NQF 7',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /', () => {
    test('returns all opportunities', async () => {
      const mockOpportunities = [
        {
          id: 1,
          title: 'Developer',
          opportunity_type: 'Internship',
          sector: 'ICT',
        },
        {
          id: 2,
          title: 'Designer',
          opportunity_type: 'Learnership',
          sector: 'Media',
        },
      ];

      db.query.mockImplementation((sql, callback) => {
        callback(null, mockOpportunities);
      });

      const res = await request(app).get('/opportunities');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    test('returns empty array when no opportunities', async () => {
      db.query.mockImplementation((sql, callback) => {
        callback(null, []);
      });

      const res = await request(app).get('/opportunities');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).get('/opportunities');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /:id', () => {
    test('returns single opportunity by id', async () => {
      const mockOpportunity = {
        id: 1,
        title: 'Developer',
        opportunity_type: 'Internship',
        description: 'Great role',
        sector: 'ICT',
      };

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, [mockOpportunity]);
      });

      const res = await request(app).get('/opportunities/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockOpportunity);
    });

    test('returns 404 when opportunity not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const res = await request(app).get('/opportunities/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Opportunity not found');
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).get('/opportunities/1');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /provider/:id', () => {
    test('returns opportunities for specific provider', async () => {
      const mockOpportunities = [
        { id: 1, title: 'Role 1', provider_id: 5 },
        { id: 2, title: 'Role 2', provider_id: 5 },
      ];

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockOpportunities);
      });

      const res = await request(app).get('/opportunities/provider/5');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).get('/opportunities/provider/1');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /:id', () => {
    test('updates opportunity successfully', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const res = await request(app)
        .put('/opportunities/1')
        .send({
          title: 'Updated Title',
          description: 'Updated description',
          stipend: 6000,
        });

      expect(res.status).toBe(404);
    });

    test('returns 404 when opportunity not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const res = await request(app)
        .put('/opportunities/999')
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app)
        .put('/opportunities/1')
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    test('deletes opportunity successfully', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const res = await request(app).delete('/opportunities/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Opportunity removed successfully');
    });

    test('returns 404 when opportunity not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const res = await request(app).delete('/opportunities/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Opportunity not found');
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).delete('/opportunities/1');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
});