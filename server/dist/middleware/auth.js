"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const db_1 = require("../config/db");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new errors_1.AppError('You are not logged in. Please log in to get access.', 401));
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'super-secret-taskflow-jwt-token-key-change-this-in-production');
        // Check if user still exists
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                workspaces: {
                    take: 1,
                },
            },
        });
        if (!user) {
            return next(new errors_1.AppError('The user belonging to this token no longer exists.', 401));
        }
        // Set user on request
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.workspaces[0]?.role, // Default to their role in their first workspace
            workspaceId: user.workspaces[0]?.workspaceId,
        };
        next();
    }
    catch (err) {
        next(new errors_1.AppError('Invalid token or token expired. Please log in again.', 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return next(new errors_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
