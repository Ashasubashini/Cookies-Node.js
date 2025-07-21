const request = require('supertest');
const app = require('../../server');


describe('DELETE /logout - PASS', () => {
  let refreshToken;

  beforeAll(async () => {
    const res = await request(app).post('/login').send({
      email: 'asha@email.com',
      password: 'asha2005'
    });
    refreshToken = res.body.refreshToken;
  });

  it('should remove refresh token and return success message', async () => {
    const res = await request(app).delete('/logout').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully.');
  });
});
