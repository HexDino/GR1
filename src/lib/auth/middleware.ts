import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './jwt'
import { JWTPayload } from './types'

/**
 * Xác thực request dựa trên JWT token
 * @param request NextRequest object
 * @param requiredAuth Có yêu cầu xác thực không, mặc định là có
 * @returns Response with payload or error
 */
export async function authenticateRequest(
  request: NextRequest, 
  requiredAuth: boolean = true
): Promise<NextResponse> {
  // Get token from cookies or Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7)
    : request.cookies.get('token')?.value

  if (!token) {
    if (requiredAuth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    } else {
      // If authentication is not required, return guest user payload
      return NextResponse.json({
        payload: {
          userId: 'guest',
          email: '',
          role: 'GUEST',
        }
      });
    }
  }

  try {
    const payload = verifyToken(token)
    return NextResponse.json({ payload });
  } catch (error) {
    if (requiredAuth) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    } else {
      // If authentication is not required, return guest user payload
      return NextResponse.json({
        payload: {
          userId: 'guest',
          email: '',
          role: 'GUEST',
        }
      });
    }
  }
} 