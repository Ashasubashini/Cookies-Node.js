/* eslint-disable */
const request = require('supertest');
const app = require('./server');

describe('GET /health', () => {
  it('should return 200 OK and status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });
}); 