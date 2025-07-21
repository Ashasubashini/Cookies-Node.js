const request = require('supertest');
const app = require('../server');

describe('GET /products - PASS', () => {
  it('should return list of products', async () => {
    const res = await request(app).get('/products?categoryId=1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
