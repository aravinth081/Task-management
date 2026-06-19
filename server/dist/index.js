"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // For development, allow any origin
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
});
const PORT = process.env.PORT || 5000;
// Global Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
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
app.use('/api/v1/auth', auth_routes_1.default);
// Socket.io Integration
io.on('connection', (socket) => {
    logger_1.logger.info(`Socket connected: ${socket.id}`);
    // Join a workspace/project/chat room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        logger_1.logger.debug(`Socket ${socket.id} joined room ${roomId}`);
    });
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        logger_1.logger.debug(`Socket ${socket.id} left room ${roomId}`);
    });
    // Example real-time chat message broadcast
    socket.on('send-message', (data) => {
        socket.to(data.roomId).emit('new-message', data.message);
    });
    // Example Kanban card move broadcast
    socket.on('task-moved', (data) => {
        socket.to(data.projectId).emit('task-updated', data.movement);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`Socket disconnected: ${socket.id}`);
    });
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Start Server
server.listen(PORT, () => {
    logger_1.logger.info(`TaskFlow API server listening on port ${PORT}`);
});
