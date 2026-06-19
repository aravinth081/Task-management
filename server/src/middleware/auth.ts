import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import { prisma } from '../config/db';
import { Role } from '@prisma/client';

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role?: Role;
  workspaceId?: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super-secret-taskflow-jwt-token-key-change-this-in-production'
    ) as JwtPayload;

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        workspaces: {
          take: 1,
        },
      },
    });

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
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
  } catch (err) {
    next(new AppError('Invalid token or token expired. Please log in again.', 401));
  }
};

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
