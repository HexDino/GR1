import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '../utils/apiError';

// Lưu trữ đơn giản trong memory cho rate limiting
// Trong production, nên thay thế bằng Redis hoặc tương tự
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

/**
 * Middleware rate limiting cho API routes
 * @param req Đối tượng request của Next.js
 * @param windowMs Cửa sổ thời gian tính bằng milliseconds
 * @param maxRequests Số lượng request tối đa được phép trong cửa sổ thời gian
 * @param identifier Hàm để trích xuất identifier từ request (mặc định là IP)
 * @returns NextResponse hoặc throw ApiError nếu vượt quá giới hạn
 */
export async function rateLimit(
  req: NextRequest,
  windowMs: number = 60 * 60 * 1000, // 1 giờ theo mặc định
  maxRequests: number = 10, // 10 requests mỗi cửa sổ thời gian theo mặc định
  identifier: (req: NextRequest) => string = (req) => req.ip || 'unknown'
) {
  const id = identifier(req);
  const now = Date.now();
  
  // Dọn dẹp các entries đã hết hạn
  Array.from(rateLimitStore.keys()).forEach(key => {
    const value = rateLimitStore.get(key);
    if (value && value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
  
  // Lấy hoặc tạo rate limit entry
  let rateLimit = rateLimitStore.get(id);
  
  if (!rateLimit) {
    rateLimit = {
      count: 0,
      resetTime: now + windowMs
    };
    rateLimitStore.set(id, rateLimit);
  }
  
  // Kiểm tra có vượt quá giới hạn không
  if (rateLimit.count >= maxRequests) {
    throw ApiError.tooManyRequests(`Rate limit exceeded. Try again after ${new Date(rateLimit.resetTime).toLocaleTimeString()}`);
  }
  
  // Tăng bộ đếm
  rateLimit.count++;
  
  // Thêm rate limit headers vào response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', (maxRequests - rateLimit.count).toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
  
  return response;
}

/**
 * Rate limiting cho đánh giá - dành riêng cho đánh giá bác sĩ
 * Giới hạn 5 đánh giá mỗi 24 giờ
 */
export async function reviewRateLimit(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  return rateLimit(
    req,
    24 * 60 * 60 * 1000, // 24 giờ
    5, // 5 đánh giá mỗi 24 giờ
    () => `review_${userId || req.ip || 'unknown'}`
  );
} 