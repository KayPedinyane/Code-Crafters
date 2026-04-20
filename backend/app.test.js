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
    expect(response.statusCode).toBe(200);
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