import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }

    if (userRole !== 'DOCTOR') {
      throw ApiError.forbidden('Only doctors can access this resource');
    }

    console.log('[DOCTOR ACTIVITY API] Using test doctor account');

    // Mock data for recent activities
    const activities = [
      {
        id: '1',
        type: 'appointment',
        title: 'Appointment Completed',
        description: 'Consultation with John Doe completed successfully',
        time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        status: 'completed',
        patientName: 'John Doe',
        icon: 'calendar'
      },
      {
        id: '2',
        type: 'review',
        title: 'New Patient Review',
        description: 'Sarah Wilson left a 5-star review',
        time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        status: 'positive',
        patientName: 'Sarah Wilson',
        rating: 5,
        icon: 'star'
      },
      {
        id: '3',
        type: 'appointment',
        title: 'Upcoming Appointment',
        description: 'Scheduled consultation with Mike Johnson in 30 minutes',
        time: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 mins from now
        status: 'upcoming',
        patientName: 'Mike Johnson',
        icon: 'clock'
      },
      {
        id: '4',
        type: 'prescription',
        title: 'Prescription Issued',
        description: 'Prescribed medication for Emily Davis',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: 'completed',
        patientName: 'Emily Davis',
        icon: 'pill'
      },
      {
        id: '5',
        type: 'patient',
        title: 'New Patient Registration',
        description: 'David Wilson registered as new patient',
        time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        status: 'new',
        patientName: 'David Wilson',
        icon: 'user-plus'
      }
    ];

    return NextResponse.json({
      success: true,
      activities,
      total: activities.length
    });

  } catch (error) {
    console.error('Error fetching doctor activities:', error);
    
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
        message: 'Failed to fetch doctor activities',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 