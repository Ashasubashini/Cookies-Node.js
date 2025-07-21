const request = require('supertest');
const app = require('../server.js');

describe('POST /register - PASS', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'asha2005',
        email: 'asha2005' + Date.now() + '@gmail.com',
        password: 'asha1234'
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('email');
  });
});
