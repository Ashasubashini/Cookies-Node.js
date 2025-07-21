const request = require('supertest');
const app = require('../server');

describe('DELETE /logout - PASS', () => {
  it('should log out a user', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'asha2005@email.com', password: 'asha1234' });

    const refreshToken = loginRes.body.refreshToken;

    const res = await request(app)
      .delete('/logout')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});