import * as jose from 'jose';
import { JWTPayload } from './types'

// Đảm bảo JWT_SECRET luôn tồn tại và là an toàn
let JWT_SECRET = process.env.JWT_SECRET
const ACCESS_TOKEN_EXPIRES = process.env.TOKEN_EXPIRES_IN || '1h'
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

// Kiểm tra an toàn cho production
if (!JWT_SECRET) {
  console.error('JWT_SECRET is missing! This is a security risk.')
  
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET must be set in production environment!')
    process.exit(1)
  } else {
    console.warn('Using an auto-generated secret for development only')
    // Trong môi trường dev, tạo secret ngẫu nhiên cho mỗi lần khởi động
    // Điều này đảm bảo không ai có thể dự đoán được secret, nhưng sẽ làm token không hợp lệ khi restart server
    JWT_SECRET = require('crypto').randomBytes(32).toString('hex')
  }
}

// Định nghĩa User interface dựa trên cấu trúc cần thiết
export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

// Chuyển đổi thời gian hạn sử dụng thành số giây
function parseExpiration(expiresIn: string): number {
  const units: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (match) {
    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
  
  // Mặc định 1 giờ nếu không phân tích được
  return 60 * 60;
}

/**
 * Tạo JWT token với payload
 * @param payload Data để mã hóa trong token
 * @param expiresIn Thời gian hết hạn (mặc định 1h)
 * @returns Chuỗi JWT token
 */
export async function generateToken(payload: JWTPayload, expiresIn: string = ACCESS_TOKEN_EXPIRES): Promise<string> {
  // Chuyển JWT_SECRET thành Uint8Array
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  
  // Tạo expirationTime từ expiresIn
  const expiresInSeconds = parseExpiration(expiresIn);
  const expirationTime = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  // Ký JWT token
  const jwt = await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secretKey);
  
  return jwt;
}

/**
 * Tạo access token
 * @param user Thông tin user
 * @returns Access token
 */
export async function generateAccessToken(user: {
  userId: string;
  email: string;
  role: string;
  name?: string;
}): Promise<string> {
  return generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role,
    name: user.name || '',
    tokenType: 'access',
  });
}

/**
 * Tạo refresh token
 * @param userId User ID
 * @returns Refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  return generateToken(
    {
      userId,
      tokenType: 'refresh',
    },
    REFRESH_TOKEN_EXPIRES
  );
}

/**
 * Xác thực và giải mã JWT token
 * @param token JWT token cần verify
 * @returns Payload hoặc thông báo lỗi nếu không hợp lệ
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    console.log('Verifying token:', token.substring(0, 10) + '...');
    
    // Chuyển JWT_SECRET thành Uint8Array
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    
    // Xác thực token
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    console.log('Token verification successful:', payload.userId, payload.role);
    
    return payload as unknown as JWTPayload;
  } catch (error) {
    // Ghi lại lỗi cụ thể
    console.error('Token verification error:', error);
    
    // Xử lý lỗi cụ thể
    if (error instanceof jose.errors.JWTExpired) {
      throw new Error('Token has expired');
    } else if (error instanceof jose.errors.JWTInvalid) {
      throw new Error('Invalid token: ' + error.message);
    } else {
      throw new Error('Failed to authenticate token: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}

/**
 * Generate new access and refresh tokens from refresh token
 * @param refreshToken Current refresh token
 * @returns New access and refresh tokens
 */
export async function refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = await verifyToken(refreshToken);
  
  if (payload.tokenType !== 'refresh') {
    throw new Error('Invalid refresh token');
  }
  
  const newAccessToken = await generateToken({
    userId: payload.userId,
    email: payload.email || '',
    role: payload.role || 'USER',
    tokenType: 'access',
  });
  
  const newRefreshToken = await generateRefreshToken(payload.userId);
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
} 