const request = require('supertest');
const app = require('../src/index');

describe('Error Handling', () => {
  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/unknown/route');
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toContain('Not Found');
  });
});
