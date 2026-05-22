const request = require('supertest');
const express = require('express');
const adminProfileRouter = require('../routes/admin_profile');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use('/admin-profile', adminProfileRouter);

describe('Admin Profile Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /', () => {
    test('updates admin profile successfully', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const res = await request(app)
        .put('/admin-profile')
        .send({
          email: 'admin@test.com',
          name: 'John',
          surname: 'Doe',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile updated');
      expect(db.query).toHaveBeenCalled();
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app)
        .put('/admin-profile')
        .send({
          email: 'admin@test.com',
          name: 'John',
          surname: 'Doe',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /:email', () => {
    test('returns admin profile by email', async () => {
      const mockProfile = {
        email: 'admin@test.com',
        name: 'John',
        surname: 'Doe',
      };

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, [mockProfile]);
      });

      const res = await request(app).get('/admin-profile/admin@test.com');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProfile);
    });

    test('returns 404 when profile not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const res = await request(app).get('/admin-profile/notfound@test.com');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Admin profile not found');
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).get('/admin-profile/admin@test.com');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
});