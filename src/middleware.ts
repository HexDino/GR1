import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth/jwt'

// In-memory store for rate limiting
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 60 // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;")
  
  // Implement basic rate limiting
  const ip = request.ip || 'unknown'
  const now = Date.now()
  
  // Clean up old entries - using Array.from to avoid iteration issues
  const entriesToDelete: string[] = []
  Array.from(ipRequestCounts.entries()).forEach(([storedIp, data]) => {
    if (data.resetTime < now) {
      entriesToDelete.push(storedIp)
    }
  })
  
  entriesToDelete.forEach(ip => ipRequestCounts.delete(ip))
  
  // Check and update rate limit
  const currentData = ipRequestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW }
  const isRateLimited = currentData.count >= RATE_LIMIT_MAX
  
  if (isRateLimited) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, please try again later' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    )
  }
  
  // Update counter
  ipRequestCounts.set(ip, {
    count: currentData.count + 1,
    resetTime: currentData.resetTime
  })
  
  // Check for protected routes
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')
  const isChatRoute = request.nextUrl.pathname.startsWith('/api/chat')
  
  if (isApiRoute && !isAuthRoute && !isChatRoute) {
    // Get token from cookies or Authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : request.cookies.get('token')?.value
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    try {
      verifyToken(token)
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
  
  return response
}

// Only apply middleware to API routes
export const config = {
  matcher: [
    '/api/:path*',
  ],
} 