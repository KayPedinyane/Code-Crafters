jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  }))
}));

jest.mock('../routes/notifications', () => ({
  createNotification: jest.fn()
}));

jest.mock('../utils/emailSender', () => ({
  sendStatusEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../db', () => ({
  promise: jest.fn(() => ({
    query: jest.fn().mockImplementation((sql) => {
      if (sql.includes('SELECT * FROM profile')) {
        return Promise.resolve([[{
          id: 1,
          email: 'test@test.com',
          nqf_level: 'NQF 6',
          full_name: 'Test User',
          qualification: 'Diploma'
        }]]);
      }
      if (sql.includes('SELECT o.*') || sql.includes('FROM opportunities')) {
        return Promise.resolve([[{
          id: 1,
          title: 'IT Learnership',
          sector: 'ICT',
          nqf_level: 'NQF 6',
          status: 'approved',
          closing_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          company_name: 'Test Company'
        }]]);
      }
      if (sql.includes('notification_tracker')) {
        return Promise.resolve([[{ notified_job_ids: '[]' }]]);
      }
      return Promise.resolve([[]]);
    })
  })),
  query: jest.fn()
}));

const { checkAndNotifyUser } = require('../utils/notificationChecker');

describe('checkAndNotifyUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('is exported as a function', () => {
    expect(typeof checkAndNotifyUser).toBe('function');
  });

  test('runs without throwing for valid email', async () => {
    await expect(checkAndNotifyUser('test@test.com')).resolves.not.toThrow();
  });

  test('handles user with no profile gracefully', async () => {
    const db = require('../db');
    db.promise.mockReturnValueOnce({
      query: jest.fn().mockResolvedValue([[]])
    });
    await expect(checkAndNotifyUser('noProfile@test.com')).resolves.not.toThrow();
  });

  test('handles db error gracefully', async () => {
    const db = require('../db');
    db.promise.mockReturnValueOnce({
      query: jest.fn().mockRejectedValue(new Error('DB connection failed'))
    });
    await expect(checkAndNotifyUser('test@test.com')).resolves.not.toThrow();
  });

  test('processes matching opportunities', async () => {
    await checkAndNotifyUser('test@test.com');
    const { createNotification } = require('../routes/notifications');
    expect(createNotification).toHaveBeenCalled();
  });
});