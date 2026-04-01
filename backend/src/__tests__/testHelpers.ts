import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from '../routes/authRoutes.js';
import projectRoutes from '../routes/projectRoutes.js';
import taskRoutes from '../routes/taskRoutes.js';

let mongod: MongoMemoryServer;

/** Build the Express app with a stubbed Socket.IO instance. */
export const buildApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Stub io so controllers that call req.app.get('io') don't crash
  const ioStub = {
    emit: () => {},
    to: () => ({ emit: () => {} }),
  };
  app.set('io', ioStub);

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/projects/:projectId/tasks', taskRoutes);

  return app;
};

/** Connect to in-memory MongoDB before tests. */
export const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  // JWT_SECRET needed by auth middleware
  process.env.JWT_SECRET = 'test_secret_key_for_jest';
};

/** Drop all collections between test suites for isolation. */
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/** Disconnect and stop the in-memory server after all tests. */
export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};
