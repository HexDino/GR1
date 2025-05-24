import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'all';
    const type = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';

    // Build where conditions based on actual schema
    const where: any = {
      userId: userId
    };

    // Filter by read status for tabs
    if (tab === 'unread') {
      where.isRead = false;
    }
    // Note: 'reminders' tab can't be implemented with current schema

    // Filter by type - convert frontend types to backend types
    if (type !== 'all') {
      const typeMapping: Record<string, string> = {
        'appointment': 'APPOINTMENT_REMINDER',
        'medication': 'PRESCRIPTION_REMINDER',
        'system': 'GENERAL',
        'health_reminder': 'HEALTH_REPORT'
      };
      where.type = typeMapping[type] || 'GENERAL';
    }

    // Filter by search term
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch notifications from database
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Transform to match frontend interface with defaults for missing fields
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: mapBackendTypeToFrontend(notification.type),
      severity: 'medium' as const, // Default since not in schema
      read: notification.isRead,
      actionRequired: notification.type.includes('REMINDER'), // Infer from type
      date: notification.createdAt.toISOString(),
      scheduledFor: undefined, // Not available in current schema
      metadata: {} // Not available in current schema
    }));

    return NextResponse.json({
      success: true,
      notifications: transformedNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Helper function to map backend types to frontend types
function mapBackendTypeToFrontend(backendType: string): string {
  const typeMapping: Record<string, string> = {
    'APPOINTMENT_REMINDER': 'appointment',
    'APPOINTMENT_CONFIRMATION': 'appointment', 
    'APPOINTMENT_CANCELLATION': 'appointment',
    'PRESCRIPTION_REMINDER': 'medication',
    'HEALTH_REPORT': 'health_reminder',
    'GENERAL': 'system'
  };
  return typeMapping[backendType] || 'system';
} 