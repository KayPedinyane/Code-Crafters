const request = require('supertest');
const express = require('express');
const loginRouter = require('../routes/login');
const db = require('../db');
const admin = require('firebase-admin');
const { checkAndNotifyUser } = require('../utils/notificationChecker');

jest.mock('../db');
jest.mock('firebase-admin');
jest.mock('../utils/notificationChecker');

const app = express();
app.use(express.json());
app.use('/auth', loginRouter);

describe('Login Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkAndNotifyUser.mockResolvedValue();
  });

  describe('POST /login', () => {
    test('logs in existing user successfully', async () => {
      const mockUser = {
        id: 1,
        firebase_uid: 'test-uid',
        email: 'user@test.com',
        role: 'user',
      };

      admin.auth = jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'test-uid',
          email: 'user@test.com',
        }),
      }));

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, [mockUser]);
      });

      const res = await request(app)
        .post('/auth/login')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('role', 'user');
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('email', 'user@test.com');
    });

    test('returns 401 when no token provided', async () => {
      const res = await request(app).post('/auth/login');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    test('returns 404 when user not found in database', async () => {
      admin.auth = jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'test-uid',
          email: 'user@test.com',
        }),
      }));

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const res = await request(app)
        .post('/auth/login')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    test('triggers notification check for applicant users', async () => {
      admin.auth = jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'test-uid',
          email: 'applicant@test.com',
        }),
      }));

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, [{
          id: 1,
          firebase_uid: 'test-uid',
          email: 'applicant@test.com',
          role: 'applicant',
        }]);
      });

      const res = await request(app)
        .post('/auth/login')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(checkAndNotifyUser).toHaveBeenCalledWith('applicant@test.com');
    });

    test('handles database error', async () => {
      admin.auth = jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'test-uid',
          email: 'user@test.com',
        }),
      }));

      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app)
        .post('/auth/login')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('POST /create', () => {
    test('creates new user successfully', async () => {
      const mockUser = {
        id: 2,
        firebase_uid: 'new-uid',
        email: 'new@test.com',
        role: 'user',
      };

      admin.auth = jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'new-uid',
          email: 'new@test.com',
        }),
      }));

      db.query
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, { insertId: 2 });
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [mockUser]);
        });

      const res = await request(app)
        .post('/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          email: 'new@test.com',
          role: 'user',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    test('returns 400 when role is missing', async () => {
      admin.auth = jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'test-uid',
          email: 'user@test.com',
        }),
      }));

      const res = await request(app)
        .post('/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          email: 'user@test.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Role is required');
    });

    test('returns 400 when email is missing', async () => {
      admin.auth = jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'test-uid',
        }),
      }));

      const res = await request(app)
        .post('/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          role: 'user',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email is required');
    });

    test('handles database error on create', async () => {
      admin.auth = jest.fn(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'test-uid',
          email: 'user@test.com',
        }),
      }));

      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app)
        .post('/auth/create')
        .set('Authorization', 'Bearer valid-token')
        .send({
          email: 'user@test.com',
          role: 'user',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('DB error');
    });
  });

  describe('DELETE /user/:uid', () => {
    test('deletes user successfully', async () => {
      db.query
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ id: 1, firebase_uid: 'test-uid' }]);
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, { affectedRows: 1 });
        });

      admin.auth = jest.fn(() => ({
        deleteUser: jest.fn().mockResolvedValue(),
      }));

      const res = await request(app)
        .delete('/auth/user/test-uid')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(401);
    });

    test('returns 404 when user not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const res = await request(app)
        .delete('/auth/user/nonexistent-uid')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(401);
    });

    test('deletes from DB even if Firebase delete fails', async () => {
      db.query
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ id: 1, firebase_uid: 'test-uid' }]);
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, { affectedRows: 1 });
        });

      admin.auth = jest.fn(() => ({
        deleteUser: jest.fn().mockRejectedValue(new Error('Firebase error')),
      }));

      const res = await request(app)
        .delete('/auth/user/test-uid')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(401);
    });
  });
});