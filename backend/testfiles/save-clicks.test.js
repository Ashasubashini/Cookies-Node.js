const request = require('supertest');
const app = require('../server');

describe('POST /save-clicks - PASS', () => {
  it('should save user clicks successfully', async () => {
    const body = {
      userId: 'd44c700d-43dd-441c-a308-d531cd2e3555',
      categoryClicks: {},
    productClicks: {}
    };

    const res = await request(app)
      .post('/save-clicks')
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
