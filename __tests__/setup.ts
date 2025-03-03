import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createClient } from 'redis-mock';

let mongoServer: MongoMemoryServer;

// Mock Redis client with promisified methods
const mockRedisClient = createClient();

// Create a type-safe mock Redis client
export const redisClient = {
  connect: async () => Promise.resolve(),
  quit: async () => Promise.resolve(),
  get: async (key: string) => {
    return new Promise<string | null>((resolve) => {
      (mockRedisClient as any).get(key, (err: Error | null, reply: string | null) => {
        if (err) resolve(null);
        resolve(reply);
      });
    });
  },
  set: async (key: string, value: string) => {
    return new Promise<boolean>((resolve) => {
      (mockRedisClient as any).set(key, value, () => resolve(true));
    });
  },
  FLUSHALL: async () => {
    return new Promise<boolean>((resolve) => {
      (mockRedisClient as any).flushall(() => resolve(true));
    });
  }
};

// Disconnect MongoDB and Redis before all tests
beforeAll(async () => {
  // Disconnect any existing connections
  await mongoose.disconnect();
  
  // Setup MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear all data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  // Clear Redis mock data
  await redisClient.FLUSHALL();
});

// Disconnect and cleanup after all tests are complete
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await redisClient.quit();
}); 