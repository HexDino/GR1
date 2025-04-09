import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Tạo response
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
  
  // Xóa tất cả cookies liên quan đến authentication
  response.cookies.delete('token');
  response.cookies.delete('refreshToken');
  
  return response;
} 