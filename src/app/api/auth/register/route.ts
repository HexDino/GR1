import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError } from '@/lib/utils/apiError';
import { createUser } from '@/services/user';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';

// Định nghĩa schema validation
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Invalid phone number format').optional(),
  role: z.enum(['PATIENT', 'DOCTOR']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      throw ApiError.validationError(validation.error.format());
    }
    
    const { email, password, name, phone, role } = validation.data;
    
    // Create user
    const user = await createUser({
      email,
      password,
      name,
      phone,
      role,
    });
    
    // Generate tokens
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
    });
    
    const refreshToken = generateRefreshToken(user.id);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
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
    };
    
    response.cookies.set('token', token, cookieOptions);
    response.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      path: '/api/auth/refresh',
    });
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
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
        message: 'Registration failed',
      },
      { status: 500 }
    );
  }
} 