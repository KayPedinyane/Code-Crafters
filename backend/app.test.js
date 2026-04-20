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
    if (typeof params === 'function') {
      params(null, []);
    } else if (typeof callback === 'function') {
      callback(null, []);
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
    expect(response.statusCode).toBe(200);
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
    expect(response.statusCode).toBe(401);
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
    expect(response.statusCode).toBe(200);
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