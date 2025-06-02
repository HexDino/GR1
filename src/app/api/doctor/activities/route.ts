import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { AppointmentStatus } from '@prisma/client';

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
    
    // Get the doctor ID
    const userId = payload.userId;
    
    // SPECIAL CASE: For test doctor account
    if (userId === 'test-doctor-id') {
      console.log('[DOCTOR ACTIVITIES API] Using test doctor account');
      
      // Return mock data for test account
      return NextResponse.json([
        {
          patientName: 'Robert Johnson',
          action: 'scheduled an appointment',
          date: 'Today'
        },
        {
          patientName: 'Maria Garcia',
          action: 'cancelled appointment',
          date: 'Yesterday'
        },
        {
          patientName: 'James Smith',
          action: 'completed checkup',
          date: '2 days ago'
        },
        {
          patientName: 'Emma Wilson',
          action: 'requested prescription renewal',
          date: '3 days ago'
        },
        {
          patientName: 'Michael Brown',
          action: 'missed appointment',
          date: 'Last week'
        }
      ]);
    }
    
    // For real doctors, fetch the data from the database
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true }
    });
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }
    
    // Get recent appointments with status changes
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id
      },
      include: {
        patient: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });
    
    // Format the response
    const activities = recentAppointments.map(appointment => {
      const patientName = appointment.patient?.name || 'Unknown Patient';
      let action = 'had an update';
      const now = new Date();
      const updateDate = new Date(appointment.updatedAt);
      let dateDisplay = '';
      
      // Determine action based on appointment status
      switch (appointment.status) {
        case 'PENDING':
          action = 'scheduled an appointment';
          break;
        case 'CONFIRMED':
          action = 'confirmed appointment';
          break;
        case 'CANCELLED':
          action = 'cancelled appointment';
          break;
        case 'COMPLETED':
          action = 'completed checkup';
          break;
        case 'MISSED':
          action = 'missed appointment';
          break;
      }
      
      // Format date relative to current time
      const diffTime = Math.abs(now.getTime() - updateDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Check if it's within the last hour
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          // Within the last hour
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          dateDisplay = diffMinutes === 0 ? 'Just now' : `${diffMinutes} minutes ago`;
        } else {
          dateDisplay = 'Today';
        }
      } else if (diffDays === 1) {
        dateDisplay = 'Yesterday';
      } else if (diffDays < 7) {
        dateDisplay = `${diffDays} days ago`;
      } else if (diffDays < 14) {
        dateDisplay = 'Last week';
      } else if (diffDays < 30) {
        dateDisplay = `${Math.floor(diffDays / 7)} weeks ago`;
      } else {
        // More than a month ago, just show the date
        dateDisplay = updateDate.toLocaleDateString();
      }
      
      return {
        patientName,
        action,
        date: dateDisplay
      };
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching doctor activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 