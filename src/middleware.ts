import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export const config = {
  matcher: [
    // Match all paths except _next, static files, favicon.ico
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/departments', '/doctors', '/about', '/contact'];
  const publicPaths = ['/icons', '/images', '/healthcare'];
  const apiPaths = ['/api/'];
  
  // Skip middleware for public routes and assets
  if (
    publicRoutes.some(route => request.nextUrl.pathname === route || 
                               request.nextUrl.pathname.startsWith(route + '/')) ||
    publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }
  
  // API routes for authentication don't need authentication
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // Check for token cookie
  const tokenCookie = request.cookies.get('token');
  
  if (!tokenCookie || !tokenCookie.value) {
    console.log('Middleware: No token found, redirect to home');
    // Redirect to login if accessing protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/'))) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
  
  try {
    // Verify the token
    console.log('Middleware: Verifying token');
    const payload = await verifyToken(tokenCookie.value);
    
    if (!payload || !payload.userId) {
      throw new Error('Invalid token payload');
    }
    
    console.log('Middleware: Token verified for user:', payload.userId, 'role:', payload.role);
    
    // Role-based access control
    if (payload && payload.role) {
      const { role } = payload;
      
      // Check access for dashboard routes
      if (request.nextUrl.pathname.startsWith('/dashboard/')) {
        // Extract the role from the URL
        const urlRole = request.nextUrl.pathname.split('/')[2]; // dashboard/{role}/*
        
        console.log('Middleware: Checking role access', { userRole: role, urlRole });
        
        // If user trying to access dashboard for different role
        if (
          (role === 'DOCTOR' && urlRole !== 'doctor') ||
          (role === 'PATIENT' && urlRole !== 'patient') ||
          (role === 'ADMIN' && urlRole !== 'admin')
        ) {
          console.log('Middleware: Redirecting to correct dashboard for role:', role);
          // Redirect to the appropriate dashboard
          let correctDashboard = `/dashboard/${role.toLowerCase()}`;
          
          // For admin users, redirect to doctors page
          if (role === 'ADMIN') {
            correctDashboard = '/dashboard/admin/doctors';
          }
          
          return NextResponse.redirect(new URL(correctDashboard, request.url));
        }
      }
    }
    
    // Set user info in request headers for API routes
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
    
    // Invalid token, redirect to login
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/api/')) {
      // Clear the invalid token
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('token');
      response.cookies.delete('refreshToken');
      return response;
    }
    
    return NextResponse.next();
  }
} 