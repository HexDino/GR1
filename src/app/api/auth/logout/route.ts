import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('[LOGOUT API] Processing logout request');
    
    // Tạo response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
    
    // Xóa tất cả cookies liên quan đến authentication
    // Xóa cookie 'token' (main auth token)
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Immediately expire
    });
    
    // Xóa cookie 'refreshToken'
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 0, // Immediately expire
    });
    
    // Xóa cookie 'auth-token' nếu có (từ test accounts)
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Immediately expire
    });
    
    // Xóa cookie 'refresh-token' nếu có (từ test accounts)
    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Immediately expire
    });
    
    console.log('[LOGOUT API] All auth cookies cleared successfully');
    
    return response;
  } catch (error) {
    console.error('[LOGOUT API] Error during logout:', error);
    
    // Even if there's an error, try to clear cookies
    const response = NextResponse.json({
      success: false,
      message: 'Logout completed with errors',
    }, { status: 500 });
    
    // Force clear cookies even on error
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    response.cookies.delete('auth-token');
    response.cookies.delete('refresh-token');
    
    return response;
  }
} 