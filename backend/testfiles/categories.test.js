const request = require('supertest');
const app = require('../server');

describe('GET /categories - PASS', () => {
  it('should return list of categories', async () => {
    const res = await request(app).get('/categories');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
