import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/database';
import { initializeQueues } from './config/queue';
import { startJobImportWorker, startJobProcessWorker, setupQueueCompletionMonitoring } from './workers/jobWorker';
import CronService from './services/cronService';
import routes from './routes';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cronService = new CronService();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

app.use('/', routes);

app.get('/api/cron/status', (req, res) => {
  res.json(cronService.getStatus());
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  cronService.stopAllTasks();
  
  await connectDB().then(() => {
    console.log('Database connection closed');
  }).catch(console.error);
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

async function startServer() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    initializeQueues();
    console.log('Queues initialized');

    startJobImportWorker();
    startJobProcessWorker();
    setupQueueCompletionMonitoring(io);
    console.log('Workers started');

    cronService.startAllTasks();
    console.log('Cron jobs started');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;