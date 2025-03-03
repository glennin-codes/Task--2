import request from 'supertest';
import { app } from './testApp';

describe('Health Check', () => {
  it('should return API status', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'API is running');
  });
}); 