const request = require('supertest');
const app = require('@server');

describe('POST /login - FAIL', () => {
  it('should fail with invalid password', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'asha@email.com',
        password: 'asha1234'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  it('should fail with missing email field', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        password: 'asha2005'
      });

    expect(res.status).toBe(500); 
  });
});
