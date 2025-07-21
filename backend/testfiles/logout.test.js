const request = require('supertest');
const app = require('../server');

describe('DELETE /logout - PASS', () => {
  it('should log out a user', async () => {
    const res = await request(app).delete('/logout');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
