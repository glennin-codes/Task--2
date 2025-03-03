import mongoose from 'mongoose';
import { createClient } from 'redis';
import express, { Request, Response } from 'express';

// Initialize Express app
const app = express();
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 8080;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/microservices';

// Redis Client - use mock client in test environment
export const redisClient = process.env.NODE_ENV === 'test' 
  ? require('../__tests__/setup').redisClient 
  : createClient({
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`
    });

// Define MongoDB schema and model
const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Item = mongoose.model('Item', itemSchema);

// API Routes

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

// Redis Routes

// Add key-value pair to Redis
app.post('/redis', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { key, value } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    
    await redisClient.set(key, value);
    return res.status(201).json({ message: 'Key-value pair added successfully', key, value });
  } catch (error) {
    console.error('Redis set error:', error);
    return res.status(500).json({ error: 'Failed to add key-value pair to Redis' });
  }
});

// Get value from Redis
app.get('/redis/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const value = await redisClient.get(key);
    
    if (value === null) {
      return res.status(404).json({ error: 'Key not found' });
    }
    
    return res.json({ key, value });
  } catch (error) {
    console.error('Redis get error:', error);
    return res.status(500).json({ error: 'Failed to retrieve value from Redis' });
  }
});

// MongoDB Routes

// Add document to MongoDB
app.post('/mongodb', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const newItem = new Item({ name, description });
    await newItem.save();
    
    return res.status(201).json({ 
      message: 'Document added successfully', 
      item: newItem 
    });
  } catch (error) {
    console.error('MongoDB save error:', error);
    return res.status(500).json({ error: 'Failed to add document to MongoDB' });
  }
});

// Get document from MongoDB
app.get('/mongodb/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    return res.json({ item });
  } catch (error) {
    console.error('MongoDB find error:', error);
    return res.status(500).json({ error: 'Failed to retrieve document from MongoDB' });
  }
});

// Get all documents from MongoDB
app.get('/mongodb', async (req: Request, res: Response) => {
  try {
    const items = await Item.find();
    return res.json({ items });
  } catch (error) {
    console.error('MongoDB find error:', error);
    return res.status(500).json({ error: 'Failed to retrieve documents from MongoDB' });
  }
});

// Connect function to be used in production
export const connect = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
};

// Only start the server if this file is run directly (not imported as a module)
if (require.main === module) {
  connect().then(() => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await redisClient.quit();
      await mongoose.connection.close();
      console.log('App terminated, connections closed');
      process.exit(0);
    });
  });
}

export { app, Item };