import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { ApiError } from '../utils/apiError';
import { prisma } from '../db/prisma';
import { JWTPayload } from './types';

// Rate limiting store - trong production nên sử dụng Redis
const ipRequestCounts: Record<string, { count: number; resetTime: number }> = {};
const MAX_REQUESTS = 50; // Số request tối đa trong khoảng thời gian
const WINDOW_MS = 60 * 1000; // 1 phút

/**
 * Middleware để giới hạn request rate
 */
export function rateLimit(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Khởi tạo hoặc reset rate limit nếu đã hết thời gian
  if (!ipRequestCounts[ip] || ipRequestCounts[ip].resetTime < now) {
    ipRequestCounts[ip] = { count: 1, resetTime: now + WINDOW_MS };
  } else {
    // Tăng count
    ipRequestCounts[ip].count++;
    
    // Kiểm tra nếu vượt quá giới hạn
    if (ipRequestCounts[ip].count > MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      throw ApiError.tooManyRequests();
    }
  }
  
  next();
}

/**
 * Middleware để log request
 */
export function logRequest(req: NextApiRequest, _: NextApiResponse, next: () => void) {
  const { method, url, headers, body } = req;
  const ip = (headers['x-forwarded-for'] as string) || 'unknown';
  const userAgent = headers['user-agent'] || 'unknown';
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
  
  // Không log sensitive data trong body (password, tokens, etc.)
  const safeBody = { ...body };
  if (safeBody.password) safeBody.password = '[REDACTED]';
  if (safeBody.token) safeBody.token = '[REDACTED]';
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Request body:', safeBody);
  }
  
  next();
}

/**
 * Middleware xác thực API request dựa trên JWT
 */
export async function authenticateRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  options: { required?: boolean; roles?: string[] } = {}
) {
  const { required = true, roles = [] } = options;
  
  try {
    // Lấy token từ authorization header hoặc cookie
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Nếu không có token nhưng auth là required
    if (!token && required) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    // Nếu không có token và auth không required
    if (!token) {
      return { authenticated: false };
    }
    
    // Verify token
    const payload = await verifyToken(token);
    
    // Kiểm tra user có tồn tại trong DB không
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        profile: {
          select: {
            name: true,
            avatar: true,
          },
        },
        UserPermission: {
          select: {
            permission: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }
    
    if (!user.isActive) {
      throw ApiError.forbidden('User account is disabled');
    }
    
    // Kiểm tra role nếu có
    if (roles.length > 0 && !roles.includes(user.role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }
    
    // Thêm thông tin người dùng vào request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || '',
      avatar: user.profile?.avatar || '',
      permissions: user.UserPermission.map((up) => up.permission.name),
    };
    
    return { authenticated: true, user: req.user };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('Authentication error:', error);
    throw ApiError.unauthorized('Invalid authentication token');
  }
}

/**
 * Middleware cho Pages Router và App Router
 */
export function withAuth(handler: any, options: { required?: boolean; roles?: string[] } = {}) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await authenticateRequest(req, res, options);
      return handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          errors: error.errors,
        });
      }
      
      console.error('Error in auth middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}

// Middleware cho App Router (Next.js 13+)
export async function appRouterAuth(
  req: NextRequest,
  options: { required?: boolean; roles?: string[] } = {}
) {
  const { required = true, roles = [] } = options;
  
  try {
    // Lấy token từ authorization header hoặc cookie
    const authHeader = req.headers.get('authorization');
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookieToken = req.cookies.get('token');
      if (cookieToken) {
        token = cookieToken.value;
      }
    }
    
    // Nếu không có token nhưng auth là required
    if (!token && required) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Nếu không có token và auth không required
    if (!token) {
      return { authenticated: false };
    }
    
    // Verify token
    const payload = await verifyToken(token);
    
    // Kiểm tra user có tồn tại trong DB không
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        profile: {
          select: {
            name: true,
            avatar: true,
          },
        },
        UserPermission: {
          select: {
            permission: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }
    
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'User account is disabled' },
        { status: 403 }
      );
    }
    
    // Kiểm tra role nếu có
    if (roles.length > 0 && !roles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Thêm thông tin người dùng vào request
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || '',
      avatar: user.profile?.avatar || '',
      permissions: user.UserPermission.map((up) => up.permission.name),
    };
    
    return { authenticated: true, user: userData };
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid authentication token' },
      { status: 401 }
    );
  }
} 