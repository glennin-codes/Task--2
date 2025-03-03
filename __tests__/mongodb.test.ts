import request from 'supertest';
import mongoose from 'mongoose';
import { app } from './testApp';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('MongoDB Routes', () => {
  describe('POST /mongodb', () => {
    it('should create a new document', async () => {
      const response = await request(app)
        .post('/mongodb')
        .send({
          name: 'Test Item',
          description: 'Test Description'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Document added successfully');
      expect(response.body.item).toHaveProperty('name', 'Test Item');
      expect(response.body.item).toHaveProperty('description', 'Test Description');
      expect(response.body.item).toHaveProperty('_id');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/mongodb')
        .send({
          description: 'Test Description'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Name is required');
    });
  });

  describe('GET /mongodb/:id', () => {
    let testItemId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/mongodb')
        .send({
          name: 'Test Item',
          description: 'Test Description'
        });
      testItemId = createResponse.body.item._id;
    });

    it('should retrieve a document by id', async () => {
      const response = await request(app).get(`/mongodb/${testItemId}`);

      expect(response.status).toBe(200);
      expect(response.body.item).toHaveProperty('name', 'Test Item');
      expect(response.body.item).toHaveProperty('description', 'Test Description');
      expect(response.body.item).toHaveProperty('_id', testItemId);
    });

    it('should return 404 if document does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/mongodb/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Document not found');
    });
  });

  describe('GET /mongodb', () => {
    beforeEach(async () => {
      await request(app)
        .post('/mongodb')
        .send({
          name: 'Test Item 1',
          description: 'Test Description 1'
        });

      await request(app)
        .post('/mongodb')
        .send({
          name: 'Test Item 2',
          description: 'Test Description 2'
        });
    });

    it('should retrieve all documents', async () => {
      const response = await request(app).get('/mongodb');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0]).toHaveProperty('name');
      expect(response.body.items[0]).toHaveProperty('description');
      expect(response.body.items[1]).toHaveProperty('name');
      expect(response.body.items[1]).toHaveProperty('description');
    });
  });
}); 