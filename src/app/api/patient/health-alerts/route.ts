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

    // Health alerts would need a dedicated table in the future
    // For now, we can return urgent notifications as alerts
    const alerts = await prisma.notification.findMany({
      where: {
        userId: userId,
        type: {
          in: ['APPOINTMENT_REMINDER', 'PRESCRIPTION_REMINDER', 'HEALTH_REPORT']
        },
        isRead: false
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Transform notifications to alert format
    const transformedAlerts = alerts.map(notification => ({
      id: notification.id,
      type: mapNotificationTypeToAlertType(notification.type),
      title: notification.title,
      message: notification.message,
      severity: 'medium' as const, // Default severity
      date: notification.createdAt.toISOString(),
      read: notification.isRead
    }));

    return NextResponse.json({
      success: true,
      alerts: transformedAlerts
    });
  } catch (error) {
    console.error('Error fetching health alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health alerts' },
      { status: 500 }
    );
  }
}

// Helper function to map notification types to alert types
function mapNotificationTypeToAlertType(notificationType: string): string {
  const typeMapping: Record<string, string> = {
    'APPOINTMENT_REMINDER': 'appointment',
    'PRESCRIPTION_REMINDER': 'medication',
    'HEALTH_REPORT': 'checkup',
    'GENERAL': 'goal'
  };
  return typeMapping[notificationType] || 'goal';
} 