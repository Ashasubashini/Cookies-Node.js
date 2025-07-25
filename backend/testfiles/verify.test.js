const request = require('supertest');
const app = require('../server');

describe('GET /verify - PASS', () => {
  it('should verify user if token is valid', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVkYTUwZDQyLWU2NzktNGU3Ni05OWNiLTAxYzFiZmZjN2Y3MCIsIm5hbWUiOiJhc2hhIiwiZW1haWwiOiJhc2hhQGVtYWlsLmNvbSIsImlhdCI6MTc1MzI0MTcyMywiZXhwIjoxNzUzMjQ1MzIzfQ.pf3H1IdCjGRh_j1d6PZIKua09QBgSEpd12fjbsp6o-w'; 
    const res = await request(app)
      .get('/verify')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
