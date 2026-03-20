const request = require('supertest');
const app = require('../src/index');

describe('Health Check API', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(0);
    expect(response.body.message).toBe('ok');
    expect(response.body.data.status).toBe('healthy');
  });
});
