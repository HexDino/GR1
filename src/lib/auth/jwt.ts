import jwt from 'jsonwebtoken'
import { JWTPayload } from './types'

// Đảm bảo JWT_SECRET luôn tồn tại và là an toàn
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_JWT_SECRET_FOR_DEV'
const ACCESS_TOKEN_EXPIRES = process.env.TOKEN_EXPIRES_IN || '1h'
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

// Kiểm tra an toàn cho production
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === undefined) {
  console.error('JWT_SECRET is missing in production environment!')
  process.exit(1)
}

// Định nghĩa User interface dựa trên cấu trúc cần thiết
export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Tạo JWT token với payload
 * @param payload Data để mã hóa trong token
 * @param expiresIn Thời gian hết hạn (mặc định 1h)
 * @returns Chuỗi JWT token
 */
export function generateToken(payload: JWTPayload, expiresIn: string = ACCESS_TOKEN_EXPIRES): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Tạo access token
 * @param user Thông tin user
 * @returns Access token
 */
export function generateAccessToken(user: {
  userId: string;
  email: string;
  role: string;
  name?: string;
}): string {
  return generateToken({
    userId: user.userId,
    email: user.email,
    role: user.role,
    name: user.name || '',
    tokenType: 'access',
  })
}

/**
 * Tạo refresh token
 * @param userId User ID
 * @returns Refresh token
 */
export function generateRefreshToken(userId: string): string {
  return generateToken(
    {
      userId,
      tokenType: 'refresh',
    },
    REFRESH_TOKEN_EXPIRES
  )
}

/**
 * Xác thực và giải mã JWT token
 * @param token JWT token cần verify
 * @returns Payload hoặc thông báo lỗi nếu không hợp lệ
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    // Cải thiện xử lý lỗi
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    } else {
      throw new Error('Failed to authenticate token')
    }
  }
}

/**
 * Tạo mới cả access và refresh token từ refresh token
 * @param refreshToken Refresh token hiện tại
 * @returns Access và refresh token mới
 */
export function refreshTokens(refreshToken: string): { accessToken: string; refreshToken: string } {
  const payload = verifyToken(refreshToken)
  
  if (payload.tokenType !== 'refresh') {
    throw new Error('Invalid refresh token')
  }
  
  const newAccessToken = generateToken({
    userId: payload.userId,
    email: payload.email || '',
    role: payload.role || 'USER',
    tokenType: 'access',
  })
  
  const newRefreshToken = generateRefreshToken(payload.userId)
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  }
} 