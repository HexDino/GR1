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
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    
    // SPECIAL CASE: For test doctor account
    if (userId === 'test-doctor-id') {
      console.log('[DOCTOR APPOINTMENTS API] Using test doctor account');
      
      // Create mock appointments based on the status filter
      let mockAppointments = [
        { 
          id: '1',
          patientName: 'Shyam Khanna', 
          patientImage: '/healthcare/avatars/patient-1.jpg', 
          service: 'Heart Disease', 
          date: '01/27',
          status: 'PENDING'
        },
        { 
          id: '2',
          patientName: 'Jean Lee Un', 
          patientImage: '/healthcare/avatars/patient-2.jpg', 
          service: 'Allergy', 
          date: '01/27',
          status: 'PENDING'
        },
        { 
          id: '3',
          patientName: 'Clara Brook', 
          patientImage: '/healthcare/avatars/patient-3.jpg', 
          service: 'Dermatology', 
          date: '01/27',
          status: 'PENDING'
        },
        { 
          id: '4',
          patientName: 'Robert Johnson', 
          patientImage: '/healthcare/avatars/patient-4.jpg', 
          service: 'Regular Checkup', 
          date: '01/28',
          status: 'CONFIRMED'
        },
        { 
          id: '5',
          patientName: 'Sophia Martinez', 
          patientImage: '/healthcare/avatars/patient-5.jpg', 
          service: 'Blood Test', 
          date: '01/26',
          status: 'COMPLETED'
        },
        { 
          id: '6',
          patientName: 'William Brown', 
          patientImage: '/healthcare/avatars/patient-6.jpg', 
          service: 'Mental Health', 
          date: '01/25',
          status: 'CANCELLED'
        }
      ];
      
      // Apply status filter if provided
      if (statusFilter) {
        mockAppointments = mockAppointments.filter(
          appointment => appointment.status === statusFilter.toUpperCase()
        );
      }
      
      return NextResponse.json(mockAppointments);
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
    
    // Prepare the filter
    const filter: any = {
      doctorId: doctor.id
    };
    
    // Add status filter if provided
    if (statusFilter) {
      filter.status = statusFilter.toUpperCase() as AppointmentStatus;
    }
    
    // Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where: filter,
      include: {
        patientRelation: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Format the response
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      patientName: appointment.patientRelation?.user.name || 'Unknown Patient',
      patientImage: appointment.patientRelation?.user.avatar || '/healthcare/avatars/default.jpg',
      service: appointment.symptoms || 'General Checkup',
      date: appointment.date.toLocaleDateString(),
      status: appointment.status
    }));
    
    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
} 