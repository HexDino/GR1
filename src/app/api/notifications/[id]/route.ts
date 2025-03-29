import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { markNotificationAsRead } from '@/lib/services/notification'
import { prisma } from '@/lib/db/prisma'
import { JWTPayload } from '@/lib/auth/types'

// Mark a single notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  try {
    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updatedNotification = await markNotificationAsRead(params.id)
    
    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

// Delete a notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request) as JWTPayload
  if ('error' in auth) return auth

  try {
    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.notification.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
} 