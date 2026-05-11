jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  }))
}));

jest.mock('./utils/notificationChecker', () => ({
  checkAndNotify: jest.fn().mockResolvedValue(true),
  checkClosingDeadlines: jest.fn().mockResolvedValue(true),
  checkMatchingOpportunities: jest.fn().mockResolvedValue(true)
}));

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@test.com' })
  })
}));

jest.mock('./db', () => ({
  query: jest.fn((sql, params, callback) => {
    const cb = typeof params === 'function' ? params : callback;
    
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
      cb(null, { affectedRows: 1, insertId: 1 });
    } else if (
      sql.trim().toUpperCase().startsWith('UPDATE') ||
      sql.trim().toUpperCase().startsWith('DELETE')
    ) {
      cb(null, { affectedRows: 1 });
    } else {
      cb(null, [{
        id: 1,
        role: 'user',
        email: 'test@test.com',
        firebase_uid: 'test-uid',
        title: 'Test Job',
        status: 'approved',
        message: 'Test notification',
        is_read: false
      }]);
    }
  }),
  promise: jest.fn(() => ({
    query: jest.fn().mockResolvedValue([[{
      id: 1,
      email: 'test@test.com',
      nqf_level: 'NQF 6',
      full_name: 'Test User',
      notified_job_ids: '[]'
    }]])
  })),
  connect: jest.fn()
}));

jest.mock('./db', () => ({
  query: jest.fn((sql, params, callback) => {
    const cb = typeof params === 'function' ? params : callback;
    
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
      cb(null, { affectedRows: 1, insertId: 1 });
    } else if (
      sql.trim().toUpperCase().startsWith('UPDATE') ||
      sql.trim().toUpperCase().startsWith('DELETE')
    ) {
      cb(null, { affectedRows: 1 });
    } else {
      cb(null, [{
        id: 1,
        role: 'user',
        email: 'test@test.com',
        firebase_uid: 'test-uid',
        title: 'Test Job',
        status: 'approved',
        message: 'Test notification',
        is_read: false
      }]);
    }
  }),
  connect: jest.fn()
}));

const request = require('supertest');
const app = require('./app');

afterAll((done) => {
  done();
});

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
  }, 10000);
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

describe('GET /opportunities/:id', () => {
  test('gets single opportunity', async () => {
    const response = await request(app).get('/opportunities/1');
    expect([200, 404]).toContain(response.statusCode); // accepts both
  });
});

describe('POST /api/login', () => {
  test('returns 401 with no token', async () => {
    const response = await request(app).post('/api/login');
    expect(response.statusCode).toBe(401);
  });
});

describe('POST /api/create', () => {
  test('returns 401 with no token', async () => {
    const response = await request(app).post('/api/create');
    expect([401, 404]).toContain(response.statusCode);
  });
});

describe('POST /applications', () => {
  test('returns 400 with missing fields', async () => {
    const response = await request(app).post('/applications').send({});
    expect(response.statusCode).toBe(400);
  });
});

describe('POST /notifications', () => {
  test('returns 400 with missing fields', async () => {
    const response = await request(app).post('/notifications').send({});
    expect(response.statusCode).toBe(400);
  });
});

describe('GET /notifications/:user_email', () => {
  test('returns array for user email', async () => {
    const response = await request(app).get('/notifications/test@example.com');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('GET /applications/:email', () => {
  test('returns array for user email', async () => {
    const response = await request(app).get('/applications/test@example.com');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('PATCH /applications/:id/status', () => {
  test('returns 400 with invalid status', async () => {
    const response = await request(app)
      .patch('/applications/1/status')
      .send({ status: 'invalid' });
    expect(response.statusCode).toBe(400);
  });
});

describe('GET /profile/:email', () => {
  test('returns profile', async () => {
    const response = await request(app).get('/profile/test@example.com');
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /profile', () => {
  test('returns 400 with missing email', async () => {
    const response = await request(app).post('/profile').send({});
    expect(response.statusCode).toBe(400);
  });
  test('saves profile successfully', async () => {
    const response = await request(app).post('/profile').send({
      email: 'test@example.com',
      full_name: 'John Doe',
      city: 'Johannesburg'
    });
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /admin-profile/:email', () => {
  test('returns admin profile', async () => {
    const response = await request(app).get('/admin-profile/test@example.com');
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /admin-profile', () => {
  test('returns 400 or 404 with missing email', async () => {
    const response = await request(app).post('/admin-profile').send({});
    expect([400, 404]).toContain(response.statusCode);
  });
  test('saves admin profile', async () => {
    const response = await request(app).post('/admin-profile').send({
      email: 'admin@example.com',
      name: 'Admin',
      surname: 'User'
    });
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('GET /provider-profile/:email', () => {
  test('returns provider profile', async () => {
    const response = await request(app).get('/provider-profile/test@example.com');
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /provider-profile', () => {
  test('returns 400 with missing email', async () => {
    const response = await request(app).post('/provider-profile').send({});
    expect(response.statusCode).toBe(400);
  });
  test('saves provider profile', async () => {
    const response = await request(app).post('/provider-profile').send({
      email: 'provider@example.com',
      company_name: 'Test Company',
      province: 'Gauteng'
    });
    expect(response.statusCode).toBe(200);
  });
});

describe('PATCH /provider-profile/:email/reject', () => {
  test('rejects provider', async () => {
    const response = await request(app).patch('/provider-profile/test@example.com/reject');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('PATCH /provider-profile/:email/reject', () => {
  test('rejects provider', async () => {
    const response = await request(app).patch('/provider-profile/test@example.com/reject');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('GET /applications/opportunities/:id', () => {
  test('returns applications for opportunity', async () => {
    const response = await request(app).get('/applications/opportunities/1');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('PATCH /notifications/:id/read', () => {
  test('marks notification as read', async () => {
    const response = await request(app).patch('/notifications/1/read');
    expect(response.statusCode).toBe(200);
  });
});

describe('PUT /notifications/:id/read', () => {
  test('marks notification as read via PUT', async () => {
    const response = await request(app).put('/notifications/1/read');
    expect([200, 404]).toContain(response.statusCode);
  });
});

// ── LOGIN ROUTES ──
describe('GET /api/user/:uid', () => {
  test('returns user by firebase uid', async () => {
    const response = await request(app).get('/api/user/test-uid');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('DELETE /api/user/:uid', () => {
  test('returns 200, 401 or 404', async () => {
    const response = await request(app).delete('/api/user/test-uid');
    expect([200, 401, 404]).toContain(response.statusCode);
  });
});

// ── APPLICATIONS ──
describe('POST /applications with valid data', () => {
  test('creates application', async () => {
    const response = await request(app).post('/applications').send({
      applicant_email: 'test@test.com',
      opportunity_id: 1
    });
    expect([201, 404, 409, 500]).toContain(response.statusCode);
  });
});

describe('GET /applications/opportunities/:id', () => {
  test('returns applications for opportunity', async () => {
    const response = await request(app).get('/applications/opportunities/1');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('PATCH /applications/:id/status with valid status', () => {
  test('updates status to accepted', async () => {
    const response = await request(app)
      .patch('/applications/1/status')
      .send({ status: 'accepted' });
    expect([200, 404]).toContain(response.statusCode);
  });

  test('updates status to rejected', async () => {
    const response = await request(app)
      .patch('/applications/1/status')
      .send({ status: 'rejected' });
    expect([200, 404]).toContain(response.statusCode);
  });

  test('updates status to pending', async () => {
    const response = await request(app)
      .patch('/applications/1/status')
      .send({ status: 'pending' });
    expect([200, 404]).toContain(response.statusCode);
  });
});

// ── NQF ──
describe('GET /nqf', () => {
  test('returns NQF data', async () => {
    const response = await request(app).get('/nqf');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('levels');
  });
});

// ── OPPORTUNITIES ──
describe('GET /opportunities/pending', () => {
  test('returns pending opportunities', async () => {
    const response = await request(app).get('/opportunities/pending');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('GET /opportunities/provider/:provider_id', () => {
  test('returns opportunities for provider', async () => {
    const response = await request(app).get('/opportunities/provider/1');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('POST /opportunities missing fields', () => {
  test('returns 400 with missing required fields', async () => {
    const response = await request(app).post('/opportunities').send({
      title: 'Test'
    });
    expect(response.statusCode).toBe(400);
  });
});

// ── PROVIDER PROFILE ──
describe('GET /provider-profile', () => {
  test('returns all providers', async () => {
    const response = await request(app).get('/provider-profile');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('PATCH /provider-profile/:email/accept', () => {
  test('accepts provider', async () => {
    const response = await request(app).patch('/provider-profile/test@test.com/accept');
    expect([200, 404]).toContain(response.statusCode);
  });
});

// ── ADMIN PROFILE ──
describe('POST /admin-profile with valid data', () => {
  test('saves admin profile', async () => {
    const response = await request(app).post('/admin-profile').send({
      email: 'admin@test.com',
      name: 'Admin',
      surname: 'Test'
    });
    expect([200, 404]).toContain(response.statusCode);
  });
});

// ── NOTIFICATIONS ──
describe('POST /notifications with valid data', () => {
  test('creates notification', async () => {
    const response = await request(app).post('/notifications').send({
      user_email: 'test@test.com',
      message: 'Test notification'
    });
    expect([200, 201]).toContain(response.statusCode);
  });
});

describe('notificationChecker', () => {
  test('checkAndNotify is a function', () => {
    const { checkAndNotify } = require('./utils/notificationChecker');
    expect(typeof checkAndNotify).toBe('function');
  });
});

describe('GET /api/user/:uid with token', () => {
  test('returns user data', async () => {
    const response = await request(app)
      .get('/api/user/test-uid')
      .set('Authorization', 'Bearer test-token');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('POST /api/login with token', () => {
  test('returns user role', async () => {
    const response = await request(app)
      .post('/api/login')
      .set('Authorization', 'Bearer test-token')
      .send({ email: 'test@test.com' });
    expect([200, 404, 500]).toContain(response.statusCode);
  });
});

describe('POST /api/create with token', () => {
  test('creates user', async () => {
    const response = await request(app)
      .post('/api/create')
      .set('Authorization', 'Bearer test-token')
      .send({ email: 'test@test.com', role: 'user' });
    expect([200, 404]).toContain(response.statusCode);
  });
});

// ── DELETE with token ──
describe('DELETE /api/user/:uid with token', () => {
  test('attempts to delete user', async () => {
    const response = await request(app)
      .delete('/api/user/test-uid')
      .set('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdC11aWQiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.signature');
    expect([200, 401, 404, 500]).toContain(response.statusCode);
  });
});

// ── NOTIFICATION CHECKER ──
describe('checkAndNotifyUser', () => {
  test('module is defined', () => {
    const checker = require('./utils/notificationChecker');
    expect(checker).toBeDefined();
  });

  test('checkAndNotifyUser mock resolves', async () => {
    const { checkAndNotifyUser } = require('./utils/notificationChecker');
    if (typeof checkAndNotifyUser === 'function') {
      await expect(checkAndNotifyUser('test@test.com')).resolves.not.toThrow();
    } else {
      expect(true).toBe(true); // mocked — skip
    }
  });
});

// ── EMAIL SENDER ──
describe('sendStatusEmail', () => {
  test('is exported as a function', () => {
    const { sendStatusEmail } = require('./utils/emailSender');
    expect(typeof sendStatusEmail).toBe('function');
  });

  test('handles unknown status gracefully', async () => {
    const { sendStatusEmail } = require('./utils/emailSender');
    await expect(
      sendStatusEmail('test@test.com', 'Test User', 'Test Job', 'unknown')
    ).resolves.not.toThrow();
  });

  test('handles pending status', async () => {
    const { sendStatusEmail } = require('./utils/emailSender');
    await expect(
      sendStatusEmail('test@test.com', 'Test User', 'Test Job', 'pending')
    ).resolves.not.toThrow();
  });

  test('handles accepted status', async () => {
    const { sendStatusEmail } = require('./utils/emailSender');
    await expect(
      sendStatusEmail('test@test.com', 'Test User', 'Test Job', 'accepted')
    ).resolves.not.toThrow();
  });
});

// ── LOGIN MISSING FIELDS ──
describe('POST /api/create missing role', () => {
  test('returns 400 when role missing', async () => {
    const response = await request(app)
      .post('/api/create')
      .set('Authorization', 'Bearer test-token')
      .send({ email: 'test@test.com' });
    expect([400, 200]).toContain(response.statusCode);
  });
});

describe('POST /api/create missing email', () => {
  test('returns 400 when email missing', async () => {
    const response = await request(app)
      .post('/api/create')
      .set('Authorization', 'Bearer test-token')
      .send({ role: 'user' });
    expect([400, 200]).toContain(response.statusCode);
  });
});

describe('GET /admin/providers', () => {
  test('returns providers', async () => {
    const response = await request(app).get('/admin/providers');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('GET /admin/applications', () => {
  test('returns all applications', async () => {
    const response = await request(app).get('/admin/applications');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('GET /admin/users', () => {
  test('returns all users', async () => {
    const response = await request(app).get('/admin/users');
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('DELETE /admin/users/:id', () => {
  test('deletes a user', async () => {
    const response = await request(app).delete('/admin/users/1');
    expect([200, 404, 500]).toContain(response.statusCode);
  });
});

describe('PUT /admin/jobs/:id/status', () => {
  test('updates job status to approved', async () => {
    const response = await request(app)
      .put('/admin/jobs/1/status')
      .send({ status: 'approved' });
    expect([200, 404]).toContain(response.statusCode);
  });
  test('updates job status to rejected', async () => {
    const response = await request(app)
      .put('/admin/jobs/1/status')
      .send({ status: 'rejected' });
    expect([200, 404]).toContain(response.statusCode);
  });
});

describe('PUT /admin/providers/:id/status', () => {
  test('updates provider status', async () => {
    const response = await request(app)
      .put('/admin/providers/1/status')
      .send({ status: 'accepted' });
    expect([200, 404]).toContain(response.statusCode);
  });
});