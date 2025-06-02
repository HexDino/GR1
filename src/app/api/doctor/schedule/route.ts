import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

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
      console.log('[DOCTOR SCHEDULE API] Using test doctor account');
      
      // Return mock data for test account
      return NextResponse.json([
        {
          id: '1',
          patientName: 'John Doe',
          patientInitials: 'JD',
          time: '8:00 AM',
          service: 'Check-up'
        },
        {
          id: '2',
          patientName: 'Sarah Kim',
          patientInitials: 'SK',
          time: '9:30 AM',
          service: 'Follow-up'
        },
        {
          id: '3',
          patientName: 'Robert Johnson',
          patientInitials: 'RJ',
          time: '11:00 AM',
          service: 'Consultation'
        },
        {
          id: '4',
          patientName: 'Maria Garcia',
          patientInitials: 'MG',
          time: '12:30 PM',
          service: 'Checkup'
        },
        {
          id: '5',
          patientName: 'James Wilson',
          patientInitials: 'JW',
          time: '2:30 PM',
          service: 'Follow-up'
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
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Fetch today's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      include: {
        patient: true
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Format the response
    const schedule = appointments.map(appointment => {
      // Get patient initials from name
      const patientName = appointment.patient?.name || 'Unknown Patient';
      const initials = patientName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      // Format time
      const timeString = new Date(appointment.date).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
      
      return {
        id: appointment.id,
        patientName,
        patientInitials: initials,
        time: timeString,
        service: appointment.symptoms || 'General Checkup'
      };
    });
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
} 