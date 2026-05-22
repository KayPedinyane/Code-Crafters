const request = require('supertest');
const express = require('express');
const contactRouter = require('../routes/contact');
const { sendEmail } = require('../utils/emailSender');

jest.mock('../utils/emailSender');

const app = express();
app.use(express.json());
app.use('/contact', contactRouter);

describe('Contact Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST / sends contact email successfully', async () => {
    sendEmail.mockResolvedValue({ messageId: 'test-id' });

    const res = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        email: 'john@test.com',
        phone: '1234567890',
        subject: 'Test Subject',
        message: 'Test message',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Sent successfully');
    expect(sendEmail).toHaveBeenCalled();
  });

  test('POST / returns 400 when required fields missing', async () => {
    const res = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        // missing email, subject, message
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Please fill in all required fields');
  });

  test('POST / handles email send failure', async () => {
    sendEmail.mockRejectedValue(new Error('Email failed'));

    const res = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        email: 'john@test.com',
        subject: 'Test',
        message: 'Test message',
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to send email');
  });

  test('POST / works without phone number', async () => {
    sendEmail.mockResolvedValue({ messageId: 'test-id' });

    const res = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        email: 'john@test.com',
        subject: 'Test Subject',
        message: 'Test message',
        // no phone
      });

    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalled();
  });
});