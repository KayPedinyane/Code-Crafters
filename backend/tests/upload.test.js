const request = require('supertest');
const express = require('express');
const path = require('path');
const uploadRouter = require('../routes/upload');

// Mock multer
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, next) => {
      // Simulate file upload
      req.file = {
        filename: 'test-1234567890.pdf',
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 12345,
      };
      next();
    },
  });
  
  multer.diskStorage = jest.fn(() => ({}));
  
  return multer;
});

const app = express();
app.use(express.json());
app.use('/upload', uploadRouter);

describe('Upload Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.BACKEND_URL;
  });

  test('POST / uploads file and returns URL', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('cv', Buffer.from('test file content'), 'resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
    expect(res.body.url).toContain('test-1234567890.pdf');
  });

  test('POST / uses default localhost URL when BACKEND_URL not set', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('cv', Buffer.from('test file content'), 'resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('http://localhost:5000');
    expect(res.body.url).toContain('/uploads/');
  });

  test('POST / uses BACKEND_URL from environment when set', async () => {
    process.env.BACKEND_URL = 'https://api.example.com';

    const res = await request(app)
      .post('/upload')
      .attach('cv', Buffer.from('test file content'), 'resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('https://api.example.com');
    expect(res.body.url).toContain('/uploads/');
  });

  test('POST / returns URL with correct format', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('cv', Buffer.from('test file content'), 'resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(/^https?:\/\/.+\/uploads\/.+\.pdf$/);
  });

  test('POST / includes filename in response', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('cv', Buffer.from('test file content'), 'resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('test-1234567890.pdf');
  });
});