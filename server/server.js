import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import vaccinationRoutes from './routes/vaccinationRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/vaccinations', vaccinationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'MediTrack API Server is running...' });
});

// Fallback middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('SIGTERM/SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB connection shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
