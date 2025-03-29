import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { 
  getUserNotifications, 
  markAllNotificationsAsRead 
} from '@/lib/services/notification'
import { JWTPayload } from '@/lib/auth/types'

// Get user notifications
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const result = await getUserNotifications(auth.userId, limit, offset)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// Mark all notifications as read
export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  try {
    await markAllNotificationsAsRead(auth.userId)
    
    return NextResponse.json({
      message: 'All notifications marked as read'
    })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
} 