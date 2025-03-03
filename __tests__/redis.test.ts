import request from 'supertest';
import { redisClient } from './setup';
import { app } from './testApp';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('Redis Routes', () => {
  describe('POST /redis', () => {
    it('should add a key-value pair to Redis', async () => {
      const response = await request(app)
        .post('/redis')
        .send({ key: 'testKey', value: 'testValue' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Key-value pair added successfully');
      expect(response.body).toHaveProperty('key', 'testKey');
      expect(response.body).toHaveProperty('value', 'testValue');

      // Verify the value was actually stored
      const storedValue = await redisClient.get('testKey');
      expect(storedValue).toBe('testValue');
    });

    it('should return 400 if key or value is missing', async () => {
      const response = await request(app)
        .post('/redis')
        .send({ key: 'testKey' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Key and value are required');
    });
  });

  describe('GET /redis/:key', () => {
    beforeEach(async () => {
      await redisClient.set('existingKey', 'existingValue');
    });

    it('should retrieve a value by key', async () => {
      const response = await request(app).get('/redis/existingKey');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('key', 'existingKey');
      expect(response.body).toHaveProperty('value', 'existingValue');
    });

    it('should return 404 if key does not exist', async () => {
      const response = await request(app).get('/redis/nonexistentKey');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Key not found');
    });
  });
}); 