const request = require('supertest');
const app = require('../../server');


describe('GET /verify - PASS', () => {
  let accessToken;

  beforeAll(async () => {
    const res = await request(app).post('/login').send({
      email: 'asha@email.com',
      password: 'asha2005'
    });
    accessToken = res.body.accessToken;
  });

  it('should return 200 and user info with valid token', async () => {
    const res = await request(app)
      .get('/verify')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.message).toBe('Token is valid.');
  });
});
