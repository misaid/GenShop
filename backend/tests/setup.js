import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, afterEach } from 'vitest';
import './utils.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;
  process.env.SECRET_KEY = 'testsecret';
  process.env.SHOP_URL = 'http://localhost:5173';
  process.env.domain = 'http://localhost:5001';

  // Avoid hitting external services in tests
  process.env.OPENAI_API_KEY = 'test-openai-disabled';
  process.env.AWS_ACCESS_KEY_ID = 'fake';
  process.env.AWS_SECRET_ACCESS_KEY = 'fake';
  process.env.AWS_REGION = 'us-east-1';
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});
