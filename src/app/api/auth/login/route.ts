import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError } from '@/lib/utils/apiError';
import { authenticateUser } from '@/services/user';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';

// Định nghĩa schema validation
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    console.log('[LOGIN API] Request received');
    
    // Parse request body
    const body = await req.json();
    console.log('[LOGIN API] Request body:', { email: body.email, remember: body.remember });
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      console.log('[LOGIN API] Validation error:', validation.error.format());
      throw ApiError.validationError(validation.error.format());
    }
    
    const { email, password, remember } = validation.data;
    
    // SPECIAL CASE: For testing - Allow login with patient@test.com/password123
    if (email === 'patient@test.com' && password === 'password123') {
      console.log('[LOGIN API] Using test patient account');
      
      // Tìm user thực trong database để lấy ID chính xác
      const realPatient = await prisma.user.findUnique({
        where: { email: 'patient@test.com' },
        select: { id: true }
      });
      
      // Tạo user với ID thực từ database nếu có, nếu không thì dùng ID giả
      const testUser = {
        userId: realPatient?.id || 'test-patient-id',
        email: 'patient@test.com',
        role: 'PATIENT',
        name: 'Test Patient',
      };
      
      console.log('[LOGIN API] Using real patient ID:', testUser.userId);
      
      // Generate tokens
      const accessToken = await generateAccessToken(testUser);
      const refreshToken = await generateRefreshToken(testUser.userId);
      
      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          user: testUser,
          token: accessToken,
        },
      });
      
      // Set cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}),
      };
      
      console.log('[LOGIN API] Setting cookies for test account');
      
      response.cookies.set('token', accessToken, cookieOptions);
      response.cookies.set('refreshToken', refreshToken, {
        ...cookieOptions,
        path: '/api/auth/refresh',
      });
      
      console.log('[LOGIN API] Test login successful');
      return response;
    }
    
    // SPECIAL CASE: For testing - Allow login with doctor@test.com/password123
    if (email === 'doctor@test.com' && password === 'password123') {
      console.log('[LOGIN API] Using test doctor account');
      
      // Tìm user thực trong database để lấy ID chính xác
      const realDoctor = await prisma.user.findUnique({
        where: { email: 'doctor@test.com' },
        select: { id: true }
      });
      
      // Tạo user với ID thực từ database nếu có, nếu không thì dùng ID giả
      const testUser = {
        userId: realDoctor?.id || 'test-doctor-id',
        email: 'doctor@test.com',
        role: 'DOCTOR',
        name: 'Test Doctor',
      };
      
      console.log('[LOGIN API] Using real doctor ID:', testUser.userId);
      
      // Generate tokens
      const accessToken = await generateAccessToken(testUser);
      const refreshToken = await generateRefreshToken(testUser.userId);
      
      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          user: testUser,
          token: accessToken,
        },
      });
      
      // Set cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}),
      };
      
      console.log('[LOGIN API] Setting cookies for test account');
      
      response.cookies.set('token', accessToken, cookieOptions);
      response.cookies.set('refreshToken', refreshToken, {
        ...cookieOptions,
        path: '/api/auth/refresh',
      });
      
      console.log('[LOGIN API] Test login successful');
      return response;
    }
    
    // Normal authentication flow
    console.log('[LOGIN API] Authenticating user:', email);
    const { user, token, refreshToken } = await authenticateUser(email, password);
    console.log('[LOGIN API] Authentication successful for user:', email, 'with role:', user.role);
    
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
    
    console.log('[LOGIN API] Setting cookies with options:', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: remember ? '30 days' : 'session',
    });
    
    response.cookies.set('token', token, cookieOptions);
    response.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      path: '/api/auth/refresh',
    });
    
    console.log('[LOGIN API] Login successful, returning response');
    return response;
  } catch (error) {
    console.error('[LOGIN API] Login error:', error);
    
    if (error instanceof ApiError) {
      console.log('[LOGIN API] API Error:', error.message, error.statusCode);
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.statusCode }
      );
    }
    
    console.log('[LOGIN API] Unknown error, returning 500');
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication failed',
      },
      { status: 500 }
    );
  }
} 