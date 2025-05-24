import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/utils/apiError';
import { refreshTokens } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.get('refreshToken')?.value;
    
    // Check if refresh token is missing
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }
    
    // Generate new access token and refresh token
    const { accessToken, refreshToken: newRefreshToken } = await refreshTokens(refreshToken);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: accessToken,
      },
    });
    
    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };
    
    response.cookies.set('token', accessToken, cookieOptions);
    response.cookies.set('refreshToken', newRefreshToken, {
      ...cookieOptions,
      path: '/api/auth/refresh',
    });
    
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    
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
        message: 'Failed to refresh token',
      },
      { status: 401 }
    );
  }
} 