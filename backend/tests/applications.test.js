const request = require('supertest');
const express = require('express');
const applicationsRouter = require('../routes/applications');
const db = require('../db');
const { createNotification } = require('../routes/notifications');
const { sendStatusEmail } = require('../utils/emailSender');

jest.mock('../db');
jest.mock('../routes/notifications');
jest.mock('../utils/emailSender');

const app = express();
app.use(express.json());
app.use('/applications', applicationsRouter);

describe('Applications Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendStatusEmail.mockResolvedValue({ success: true });
    createNotification.mockImplementation((email, message, callback) => callback());
  });

  describe('POST /', () => {
    test('creates new application successfully', async () => {
      // Mock getUserIdByEmail
      db.query
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ id: 5 }]); // User found
        })
        // Check for duplicate
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, []); // No duplicate
        })
        // Insert application
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, { insertId: 10 });
        })
        // Get saved application
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ id: 10, applicant_id: 5, opportunity_id: 1 }]);
        })
        // Get provider email
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ email: 'provider@test.com' }]);
        })
        // Get applicant info for email
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ full_name: 'John Doe', title: 'Dev Role' }]);
        });

      const res = await request(app)
        .post('/applications')
        .send({
          applicant_email: 'applicant@test.com',
          opportunity_id: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    test('returns 400 when required fields missing', async () => {
      const res = await request(app)
        .post('/applications')
        .send({
          applicant_email: 'test@test.com',
          // missing opportunity_id
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('applicant_email and opportunity_id are required');
    });

    test('returns 404 when user not found', async () => {
      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, []); // No user found
      });

      const res = await request(app)
        .post('/applications')
        .send({
          applicant_email: 'notfound@test.com',
          opportunity_id: 1,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    test('returns 409 when already applied', async () => {
      db.query
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ id: 5 }]); // User found
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ id: 1 }]); // Duplicate found
        });

      const res = await request(app)
        .post('/applications')
        .send({
          applicant_email: 'test@test.com',
          opportunity_id: 1,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Already applied');
    });

    test('handles database error on user lookup', async () => {
      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app)
        .post('/applications')
        .send({
          applicant_email: 'test@test.com',
          opportunity_id: 1,
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /opportunities/:id', () => {
    test('returns applications for an opportunity', async () => {
      const mockApplications = [
        {
          id: 1,
          applicant_email: 'user@test.com',
          status: 'pending',
          title: 'Dev Role',
        },
      ];

      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockApplications);
      });

      const res = await request(app).get('/applications/opportunities/1');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual(mockApplications);
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).get('/applications/opportunities/1');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /:email', () => {
    test('returns applications for a user', async () => {
      const mockApplications = [
        {
          id: 1,
          applicant_email: 'user@test.com',
          status: 'pending',
        },
      ];

      db.query
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ id: 5 }]); // User found
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, mockApplications);
        });

      const res = await request(app).get('/applications/user@test.com');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('handles URL-encoded email', async () => {
      db.query
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{ id: 5 }]);
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, []);
        });

      const res = await request(app).get('/applications/user%40test.com');

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /:id/status', () => {
    test('updates application status successfully', async () => {
      db.query
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, { affectedRows: 1 });
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback(null, [{
            applicant_email: 'user@test.com',
            full_name: 'John Doe',
            title: 'Dev Role',
          }]);
        });

      const res = await request(app)
        .patch('/applications/1/status')
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Application status updated successfully');
      expect(sendStatusEmail).toHaveBeenCalled();
    });

    test('returns 400 for invalid status', async () => {
      const res = await request(app)
        .patch('/applications/1/status')
        .send({ status: 'invalid' });

      expect(res.status).toBe(400);
    });

    test('returns 404 when application not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const res = await request(app)
        .patch('/applications/999/status')
        .send({ status: 'accepted' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Application not found');
    });

    test('accepts all valid statuses', async () => {
      const validStatuses = ['pending', 'accepted', 'rejected', 'shortlisted'];

      for (const status of validStatuses) {
        db.query
          .mockImplementationOnce((sql, params, callback) => {
            callback(null, { affectedRows: 1 });
          })
          .mockImplementationOnce((sql, params, callback) => {
            callback(null, [{
              applicant_email: 'user@test.com',
              full_name: 'John',
              title: 'Role',
            }]);
          });

        const res = await request(app)
          .patch('/applications/1/status')
          .send({ status });

        expect(res.status).toBe(200);
      }
    });
  });

  describe('PUT /:id/read', () => {
    test('marks notification as read', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const res = await request(app).put('/applications/1/read');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Notification marked as read');
    });

    test('returns 404 when notification not found', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const res = await request(app).put('/applications/999/read');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Notification not found');
    });

    test('handles database error', async () => {
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const res = await request(app).put('/applications/1/read');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
});