const request = require('supertest');
const app = require('@server');


describe('GET /categories - PASS', () => {
  it('should return a list of categories', async () => {
    const res = await request(app).get('/categories');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });
});
