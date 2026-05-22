const request = require('supertest');
const express = require('express');
const notificationsRouter = require('../routes/notifications');
const db = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use('/notifications', notificationsRouter);

describe('Notifications Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    test('creates notification successfully', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { insertId: 1 });
      });

      const res = await request(app)
        .post('/notifications')
        .send({
          user_email: 'user@test.com',
          message: 'Test notification',
        });

      expect(res.status).toBe(201);
      expect(db.query).toHaveBeenCalled();
    });

    test('returns 400 when user_email missing', async () => {
      const res = await request(app)
        .post('/notifications')
        .send({
          message: 'Test notification',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('returns 400 when message missing', async () => {
      const res = await request(app)
        .post('/notifications')
        .send({
          user_email: 'user@test.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app)
        .post('/notifications')
        .send({
          user_email: 'user@test.com',
          message: 'Test notification',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /:email', () => {
    test('returns notifications for user', async () => {
      const mockNotifications = [
        {
          id: 1,
          user_email: 'user@test.com',
          message: 'Notification 1',
          is_read: false,
          created_at: new Date(),
        },
        {
          id: 2,
          user_email: 'user@test.com',
          message: 'Notification 2',
          is_read: true,
          created_at: new Date(),
        },
      ];

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockNotifications);
      });

      const res = await request(app).get('/notifications/user@test.com');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    test('returns empty array when no notifications', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const res = await request(app).get('/notifications/user@test.com');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).get('/notifications/user@test.com');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PATCH /:id/read', () => {
    test('marks notification as read', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const res = await request(app).patch('/notifications/1/read');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Notification marked as read');
    });

    test('returns 404 when notification not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const res = await request(app).patch('/notifications/999/read');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Notification not found');
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).patch('/notifications/1/read');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /:id', () => {
    test('deletes notification successfully', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const res = await request(app).delete('/notifications/1');

      expect(res.status).toBe(404);
    });

    test('returns 404 when notification not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const res = await request(app).delete('/notifications/999');

      expect(res.status).toBe(404);
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).delete('/notifications/1');

      expect(res.status).toBe(404);
    });
  });
});