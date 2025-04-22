import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

// This API will return system announcements and notifications for the user
export async function GET(req: NextRequest) {
  try {
    // Get the auth token from cookie
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const payload = await verifyToken(token);
    
    // Get the user ID
    const userId = payload.userId;
    
    // SPECIAL CASE: For test account
    if (userId === 'test-doctor-id' || userId === 'test-patient-id' || userId === 'test-admin-id') {
      console.log('[ANNOUNCEMENTS API] Using test account for:', userId);
      
      // Return mock data for test account
      return NextResponse.json([
        { 
          id: '1',
          message: 'Meeting has been rescheduled for May 28...',
          sender: 'Admin',
          senderImage: '/healthcare/avatars/admin-1.jpg',
          date: '2023-05-20'
        },
        { 
          id: '2',
          message: 'We request our doctors to use our updated clinical guidelines for telemedicine consultations...',
          sender: 'System',
          senderImage: '/healthcare/avatars/admin-2.jpg',
          date: '2023-05-18'
        },
        { 
          id: '3',
          message: 'New healthcare protocols are now available in the resource center...',
          sender: 'Admin',
          senderImage: '/healthcare/avatars/admin-1.jpg',
          date: '2023-05-15'
        },
        { 
          id: '4',
          message: 'Reminder: Annual medical conference registrations close on June 1st...',
          sender: 'System',
          senderImage: '/healthcare/avatars/admin-2.jpg',
          date: '2023-05-10'
        }
      ]);
    }
    
    // For real users, fetch notifications from the database
    // Get user's notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        type: 'GENERAL' // Only include general notifications (announcements)
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    // Format the response
    const formattedAnnouncements = notifications.map(notification => ({
      id: notification.id,
      message: notification.message,
      sender: notification.title, // We'll use the title as the sender name
      senderImage: '/healthcare/avatars/admin-1.jpg', // Default sender image
      date: notification.createdAt.toISOString().split('T')[0]
    }));
    
    return NextResponse.json(formattedAnnouncements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
} 