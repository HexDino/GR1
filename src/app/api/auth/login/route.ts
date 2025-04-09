import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError } from '@/lib/utils/apiError';
import { authenticateUser } from '@/services/user';

// Định nghĩa schema validation
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      throw ApiError.validationError(validation.error.format());
    }
    
    const { email, password, remember } = validation.data;
    
    // Authenticate user
    const { user, token, refreshToken } = await authenticateUser(email, password);
    
    // Create response with JWT token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name || '',
        },
        token,
      },
    });
    
    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      // Nếu remember me, set cookie sẽ hết hạn sau 30 ngày, ngược lại sẽ là session cookie
      ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}),
    };
    
    response.cookies.set('token', token, cookieOptions);
    response.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      path: '/api/auth/refresh',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication failed',
      },
      { status: 500 }
    );
  }
} 