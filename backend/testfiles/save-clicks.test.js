const request = require('supertest');
const app = require('../server.js');

describe('POST /save-clicks - PASS', () => {
  it('should save user click data successfully', async () => {
    const res = await request(app).post('/save-clicks').send({
      userId: 1,
      categoryClicks: { "Electronics": 3 },
      productClicks: { "Bluetooth Speaker": 2 }
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Clicks saved!');
  });
});
