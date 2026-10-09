import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import routes
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import workoutSessionRoutes from './routes/workoutSessionRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import splitRoutes from './routes/splitRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Import error handlers
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repx';
const DB_NAME = process.env.MONGODB_DB || 'repx';

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, or any local origin during development
      if (!origin || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (origin === (process.env.CLIENT_URL || 'http://localhost:5173')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check Endpoint (Requirement 25)
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    database: isConnected ? 'connected' : 'disconnected',
    databaseName: DB_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Register REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/workout-sessions', workoutSessionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api', socialRoutes); // /api/feed, /api/posts, /api/friends
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ai', aiRoutes);

// Database connection helper with connection caching for serverless / Vercel
let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
    });
    isConnected = true;
    console.log('MongoDB: CONNECTED');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (!process.env.VERCEL) {
      console.error('Please ensure MongoDB is running or check your MONGODB_URI.');
    }
  }
};

// Auto-connect on Vercel serverless requests
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    await connectDB();
  }
  next();
});

// Fallback error handlers
app.use(notFound);
app.use(errorHandler);

// Standalone local server startup (skipped when running inside Vercel serverless)
if (!process.env.VERCEL) {
  console.log('REPX SERVER STARTING...');
  connectDB().then(() => {
    console.log('====================================');
    console.log(`Database: ${DB_NAME}`);
    console.log(`Server: http://localhost:${PORT}`);
    console.log('====================================');

    app.listen(PORT, () => {
      console.log(`REPX API ready on port ${PORT}`);
    });
  });
}

export default app;
