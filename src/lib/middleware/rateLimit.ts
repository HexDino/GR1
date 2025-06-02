import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '../utils/apiError';

// Simple in-memory store for rate limiting
// In production, this should be replaced with Redis or similar
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

/**
 * Rate limiting middleware for API routes
 * @param req The Next.js request object
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum number of requests allowed in the window
 * @param identifier Function to extract identifier from request (defaults to IP)
 * @returns NextResponse or throws ApiError if limit exceeded
 */
export async function rateLimit(
  req: NextRequest,
  windowMs: number = 60 * 60 * 1000, // 1 hour by default
  maxRequests: number = 10, // 10 requests per window by default
  identifier: (req: NextRequest) => string = (req) => req.ip || 'unknown'
) {
  const id = identifier(req);
  const now = Date.now();
  
  // Clean up expired entries
  Array.from(rateLimitStore.keys()).forEach(key => {
    const value = rateLimitStore.get(key);
    if (value && value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
  
  // Get or create rate limit entry
  let rateLimit = rateLimitStore.get(id);
  
  if (!rateLimit) {
    rateLimit = {
      count: 0,
      resetTime: now + windowMs
    };
    rateLimitStore.set(id, rateLimit);
  }
  
  // Check if limit exceeded
  if (rateLimit.count >= maxRequests) {
    throw ApiError.tooManyRequests(`Rate limit exceeded. Try again after ${new Date(rateLimit.resetTime).toLocaleTimeString()}`);
  }
  
  // Increment counter
  rateLimit.count++;
  
  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', (maxRequests - rateLimit.count).toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
  
  return response;
}

/**
 * Review rate limiting - specific for doctor reviews
 * Limits to 5 reviews per 24 hours
 */
export async function reviewRateLimit(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  return rateLimit(
    req,
    24 * 60 * 60 * 1000, // 24 hours
    5, // 5 reviews per 24 hours
    () => `review_${userId || req.ip || 'unknown'}`
  );
} 