const request = require('supertest');
const app = require('../server.js');

describe('GET /products - PASS', () => {
  it('should return products for valid categoryId', async () => {
    const res = await request(app).get('/products').query({ categoryId: 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
