import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export const config = {
  matcher: [
    // Khớp tất cả đường dẫn trừ _next, static files, favicon.ico
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};

export async function middleware(request: NextRequest) {
  // Các route công khai không cần xác thực
  const publicRoutes = ['/login', '/register', '/', '/departments', '/doctors', '/about', '/contact'];
  const publicPaths = ['/icons', '/images', '/healthcare'];
  const apiPaths = ['/api/'];
  
  // Bỏ qua middleware cho các route công khai và tài nguyên
  if (
    publicRoutes.some(route => request.nextUrl.pathname === route || 
                               request.nextUrl.pathname.startsWith(route + '/')) ||
    publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }
  
  // Các API route cho xác thực không cần xác thực
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // Kiểm tra token cookie
  const tokenCookie = request.cookies.get('token');
  
  if (!tokenCookie || !tokenCookie.value) {
    console.log('Middleware: No token found, redirect to home');
    // Chuyển hướng đến đăng nhập nếu truy cập route được bảo vệ
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/'))) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
  
  try {
    // Xác minh token
    console.log('Middleware: Verifying token');
    const payload = await verifyToken(tokenCookie.value);
    
    if (!payload || !payload.userId) {
      throw new Error('Invalid token payload');
    }
    
    console.log('Middleware: Token verified for user:', payload.userId, 'role:', payload.role);
    
    // Kiểm soát truy cập dựa trên vai trò
    if (payload && payload.role) {
      const { role } = payload;
      
      // Kiểm tra quyền truy cập cho các route dashboard
      if (request.nextUrl.pathname.startsWith('/dashboard/')) {
        // Trích xuất vai trò từ URL
        const urlRole = request.nextUrl.pathname.split('/')[2]; // dashboard/{role}/*
        
        console.log('Middleware: Checking role access', { userRole: role, urlRole });
        
        // Nếu người dùng cố gắng truy cập dashboard của vai trò khác
        if (
          (role === 'DOCTOR' && urlRole !== 'doctor') ||
          (role === 'PATIENT' && urlRole !== 'patient') ||
          (role === 'ADMIN' && urlRole !== 'admin')
        ) {
          console.log('Middleware: Redirecting to correct dashboard for role:', role);
          // Chuyển hướng đến dashboard phù hợp
          let correctDashboard = `/dashboard/${role.toLowerCase()}`;
          
          // Đối với admin, chuyển hướng đến trang doctors
          if (role === 'ADMIN') {
            correctDashboard = '/dashboard/admin/doctors';
          }
          
          return NextResponse.redirect(new URL(correctDashboard, request.url));
        }
      }
    }
    
    // Thiết lập thông tin người dùng trong request headers cho API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role || '');
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware: Token validation error:', error);
    
    // Token không hợp lệ, chuyển hướng đến đăng nhập
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/api/')) {
      // Xóa token không hợp lệ
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      response.cookies.delete('refreshToken');
      return response;
    }
    
    return NextResponse.next();
  }
} 