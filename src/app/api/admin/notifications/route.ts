import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(req: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    // Only allow ADMIN users to access this endpoint
    if (userRole !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }
    
    // In a real application, you would fetch notifications from the database
    // For example: await prisma.notification.findMany({ where: { userId } })
    
    // For now, we'll return some sample notifications
    const notifications = [
      {
        id: '1',
        type: 'warning',
        message: 'New doctor registration request',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        isRead: false
      },
      {
        id: '2',
        type: 'info',
        message: 'System update available',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        isRead: false
      },
      {
        id: '3',
        type: 'success',
        message: 'Database backup completed',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        isRead: true
      },
      {
        id: '4',
        type: 'warning',
        message: 'New user reviews need approval',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        isRead: false
      },
      {
        id: '5',
        type: 'info',
        message: 'Monthly report generated',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true
      }
    ];
    
    // Count unread notifications
    const unreadCount = notifications.filter(notification => !notification.isRead).length;
    
    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
    
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch notifications',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 