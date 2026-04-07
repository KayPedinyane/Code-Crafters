const request = require('supertest');
const app = require('./app');

describe('GET /', () => {
    test('responds with API running', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('API running');
    });
});