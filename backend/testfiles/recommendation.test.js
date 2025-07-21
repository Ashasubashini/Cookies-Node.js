const request = require('supertest');
const app = require('../../server');

describe('GET /recommendations - PASS', () => {
  it('should return recommended products for user with clicks', async () => {
    const res = await request(app).get('/recommendations').query({ userId: 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
