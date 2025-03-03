import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createClient } from 'redis-mock';

let mongoServer: MongoMemoryServer | undefined;

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

// Increase timeout for setup
jest.setTimeout(30000);

// Disconnect MongoDB and Redis before all tests
beforeAll(async () => {
  try {
    // Disconnect any existing connections
    await mongoose.disconnect();
    
    // Setup MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

// Clear all data after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      // Clear Redis mock data
      await redisClient.FLUSHALL();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
});

// Disconnect and cleanup after all tests are complete
afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    await redisClient.quit();
  } catch (error) {
    console.error('Teardown failed:', error);
  }
}); 