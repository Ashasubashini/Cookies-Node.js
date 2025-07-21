const request = require('supertest');
const app = require('../server');

describe('GET /recommendations - PASS', () => {
  it('should return recommended products for user with clicks', async () => {
    const res = await request(app).get('/recommendations?userId=d44c700d-43dd-441c-a308-d531cd2e3555');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
