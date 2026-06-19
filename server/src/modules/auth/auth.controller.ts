import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/errors';
import { sendEmail } from '../../utils/email';
import { Role } from '@prisma/client';

const signToken = (id: string, email: string, name: string): string => {
  return jwt.sign(
    { id, email, name },
    (process.env.JWT_SECRET || 'super-secret-taskflow-jwt-token-key-change-this-in-production') as jwt.Secret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any,
    } as jwt.SignOptions
  );
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email and password', 400));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and workspace in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // 2. Create Workspace
      const workspaceName = companyName || `${name}'s Workspace`;
      const slug = workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
        },
      });

      // 3. Create WorkspaceMember (Super Admin of this workspace)
      const member = await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: Role.SUPER_ADMIN,
        },
      });

      // 4. Create default project to help them onboard
      const project = await tx.project.create({
        data: {
          name: 'Welcome Project',
          key: 'WEL',
          description: 'A workspace default onboarding project.',
          workspaceId: workspace.id,
        },
      });

      // 5. Create basic Kanban task columns
      await tx.task.create({
        data: {
          number: 1,
          title: 'Review the TaskFlow dashboard widgets',
          status: 'TODO',
          priority: 'MEDIUM',
          position: 1000,
          projectId: project.id,
          createdById: user.id,
        },
      });

      await tx.task.create({
        data: {
          number: 2,
          title: 'Invite your team members to this workspace',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          position: 1000,
          projectId: project.id,
          createdById: user.id,
        },
      });

      return { user, workspace };
    });

    const token = signToken(result.user.id, result.user.email, result.user.name);

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatar: result.user.avatar,
        },
        workspace: result.workspace,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.ip,
      },
    });

    const token = signToken(user.id, user.email, user.name);

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        workspace: user.workspaces[0]?.workspace,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        workspaces: user.workspaces.map((w) => ({
          id: w.workspace.id,
          name: w.workspace.name,
          slug: w.workspace.slug,
          role: w.role,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Temp store for simple memory-based OTP verification in development
const otpStore = new Map<string, { code: string; expiresAt: Date }>();

export const requestOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    // Find if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError('No user found with that email address', 404));
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    otpStore.set(email, { code: otp, expiresAt });

    // Send email
    await sendEmail({
      email,
      subject: 'Your TaskFlow OTP Verification Code',
      message: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563EB;">TaskFlow</h2>
          <p>You requested a verification code to access or reset your password. Please use the following code:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 15px; background-color: #f8fafc; text-align: center; margin: 20px 0; border-radius: 6px; color: #0f172a;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return next(new AppError('Please provide email and OTP code', 400));
    }

    const savedOtp = otpStore.get(email);
    if (!savedOtp) {
      return next(new AppError('No OTP request found or code expired', 400));
    }

    if (savedOtp.expiresAt.getTime() < Date.now()) {
      otpStore.delete(email);
      return next(new AppError('OTP expired. Please request a new code.', 400));
    }

    if (savedOtp.code !== code) {
      return next(new AppError('Invalid OTP code', 400));
    }

    otpStore.delete(email);

    // Get user and generate reset token
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate a reset token that is valid for 15 mins
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, action: 'reset-password' },
      (process.env.JWT_SECRET || 'super-secret-taskflow-jwt-token-key-change-this-in-production') as jwt.Secret,
      { expiresIn: '15m' } as jwt.SignOptions
    );

    res.status(200).json({
      status: 'success',
      data: {
        resetToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return next(new AppError('Please provide resetToken and newPassword', 400));
    }

    // Verify token
    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET || 'super-secret-taskflow-jwt-token-key-change-this-in-production'
    ) as { id: string; action: string };

    if (decoded.action !== 'reset-password') {
      return next(new AppError('Invalid reset token action', 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: decoded.id },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (err) {
    next(new AppError('Invalid or expired reset token', 400));
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, profile } = req.body;

    let email: string;
    let name: string;
    let avatar: string | undefined;
    let googleId: string;

    if (token) {
      // Real Google Token Verification via Google's tokeninfo API
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (!response.ok) {
          return next(new AppError('Invalid Google token', 400));
        }
        const data = await response.json() as any;
        email = data.email;
        name = data.name;
        avatar = data.picture;
        googleId = data.sub;
      } catch (err) {
        return next(new AppError('Failed to verify Google token', 400));
      }
    } else if (profile) {
      // Mock bypass for development
      email = profile.email;
      name = profile.name;
      avatar = profile.avatar;
      googleId = profile.googleId || `mock-google-id-${Date.now()}`;
    } else {
      return next(new AppError('Please provide a Google token or profile', 400));
    }

    if (!email || !name) {
      return next(new AppError('Google profile is missing email or name', 400));
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    let workspace: any = null;

    if (user) {
      // User exists - update googleId if not set, and lastLogin
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatar: user.avatar || avatar,
          lastLoginAt: new Date(),
          lastLoginIp: req.ip,
        },
        include: {
          workspaces: {
            include: {
              workspace: true,
            },
          },
        },
      });
      workspace = user.workspaces[0]?.workspace;
    } else {
      // New user - sign up with Google details in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create User
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            googleId,
            avatar,
          },
        });

        // 2. Create Workspace
        const workspaceName = `${name}'s Workspace`;
        const slug = workspaceName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

        const newWorkspace = await tx.workspace.create({
          data: {
            name: workspaceName,
            slug,
          },
        });

        // 3. Create WorkspaceMember
        await tx.workspaceMember.create({
          data: {
            userId: newUser.id,
            workspaceId: newWorkspace.id,
            role: Role.SUPER_ADMIN,
          },
        });

        // 4. Create default project
        const project = await tx.project.create({
          data: {
            name: 'Welcome Project',
            key: 'WEL',
            description: 'A workspace default onboarding project.',
            workspaceId: newWorkspace.id,
          },
        });

        // 5. Create basic Kanban task columns
        await tx.task.create({
          data: {
            number: 1,
            title: 'Review the TaskFlow dashboard widgets',
            status: 'TODO',
            priority: 'MEDIUM',
            position: 1000,
            projectId: project.id,
            createdById: newUser.id,
          },
        });

        return { user: newUser, workspace: newWorkspace };
      });

      user = result.user as any;
      workspace = result.workspace;
    }

    const appToken = signToken(user!.id, user!.email, user!.name);

    res.status(200).json({
      status: 'success',
      data: {
        token: appToken,
        user: {
          id: user!.id,
          name: user!.name,
          email: user!.email,
          avatar: user!.avatar,
        },
        workspace,
      },
    });
  } catch (err) {
    next(err);
  }
};

