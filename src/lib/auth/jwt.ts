import * as jwt from 'jsonwebtoken'

// Avoid using process.env directly to prevent TypeScript errors
const JWT_SECRET = (typeof process !== 'undefined' && process.env && process.env.JWT_SECRET) || 'your-super-secret-jwt-key'

// Define User interface based on the structure needed in this file
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}

export function generateRefreshToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
} 