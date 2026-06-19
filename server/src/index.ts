import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TaskFlow API Server is healthy and running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// Socket.io Integration
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join a workspace/project/chat room
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    logger.debug(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    logger.debug(`Socket ${socket.id} left room ${roomId}`);
  });

  // Example real-time chat message broadcast
  socket.on('send-message', (data: { roomId: string; message: unknown }) => {
    socket.to(data.roomId).emit('new-message', data.message);
  });

  // Example Kanban card move broadcast
  socket.on('task-moved', (data: { projectId: string; movement: unknown }) => {
    socket.to(data.projectId).emit('task-updated', data.movement);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
server.listen(PORT, () => {
  logger.info(`TaskFlow API server listening on port ${PORT}`);
});
