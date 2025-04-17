import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/departments', '/doctors', '/about', '/contact'];
  const publicPaths = ['/icons', '/images', '/healthcare'];
  
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
  
  // Check for auth token - explicit null check
  const authCookieValue = request.cookies.get('auth-token')?.value;
  
  if (!authCookieValue) {
    // Redirect to login if accessing protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
  
  try {
    // Handle the token - this is a string now since we checked above
    const tokenString: string = authCookieValue;
    const payload = verifyToken(tokenString);
    
    // Role-based access control
    const { role } = payload;
    
    // Patient restricted routes
    if (role === 'PATIENT' && request.nextUrl.pathname.startsWith('/dashboard/admin')) {
      return NextResponse.redirect(new URL('/dashboard/patient', request.url));
    }
    
    // Doctor restricted routes
    if (role === 'DOCTOR' && request.nextUrl.pathname.startsWith('/dashboard/admin')) {
      return NextResponse.redirect(new URL('/dashboard/doctor', request.url));
    }
    
    // Set user info in request headers for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all paths except _next, static files, favicon.ico
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 