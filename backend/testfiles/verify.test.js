const request = require('supertest');
const app = require('../server');

describe('GET /verify - PASS', () => {
  it('should verify user if token is valid', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ0NGM3MDBkLTQzZGQtNDQxYy1hMzA4LWQ1MzFjZDJlMzU1NSIsIm5hbWUiOiJhc2hhIiwiZW1haWwiOiJhc2hhQGVtYWlsLmNvbSIsImlhdCI6MTc1MzA4OTA5MywiZXhwIjoxNzUzMDkyNjkzfQ.MIVxoNzgpa51viGXgb0Xo8OkTdphr5cI9GapIOSgQ0o'; 
    const res = await request(app)
      .get('/verify')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
