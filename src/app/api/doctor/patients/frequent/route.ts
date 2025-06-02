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
      console.log('[DOCTOR FREQUENT PATIENTS API] Using test doctor account');
      
      // Return mock data for test account
      return NextResponse.json([
        { 
          id: '1',
          name: 'Shyam Khanna', 
          image: '/healthcare/avatars/patient-1.jpg', 
          condition: 'Heart Disease', 
          visitCount: 27
        },
        { 
          id: '2',
          name: 'James Cleveland', 
          image: '/healthcare/avatars/patient-2.jpg', 
          condition: 'Diabetes', 
          visitCount: 22
        },
        { 
          id: '3',
          name: 'Tyler Johnson', 
          image: '/healthcare/avatars/patient-3.jpg', 
          condition: 'Hypertension', 
          visitCount: 18
        },
        { 
          id: '4',
          name: 'Emma Wilson', 
          image: '/healthcare/avatars/patient-4.jpg', 
          condition: 'Asthma', 
          visitCount: 15
        },
        { 
          id: '5',
          name: 'Olivia Garcia', 
          image: '/healthcare/avatars/patient-5.jpg', 
          condition: 'Arthritis', 
          visitCount: 12
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
    
    // Find frequent patients by counting appointments
    const patientVisits = await prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        doctorId: doctor.id,
        status: 'COMPLETED'
      },
      _count: {
        patientId: true
      },
      orderBy: {
        _count: {
          patientId: 'desc'
        }
      },
      take: 5
    });
    
    // Get patient details for these frequent visitors
    const patientIds = patientVisits.map(visit => visit.patientId);
    
    // First get patients
    const patients = await prisma.patient.findMany({
      where: {
        id: {
          in: patientIds
        }
      },
      include: {
        user: true
      }
    });
    
    // Get the latest appointment for each patient separately
    const patientAppointments = await Promise.all(
      patients.map(async (patient) => {
        const latestAppointment = await prisma.appointment.findFirst({
          where: {
            patientId: patient.id,
            doctorId: doctor.id
          },
          orderBy: {
            date: 'desc'
          }
        });
        
        return {
          ...patient,
          latestAppointment
        };
      })
    );
    
    // Format the response
    const formattedPatients = patientAppointments.map(patient => {
      // Find the visit count from the patientVisits array
      const visitInfo = patientVisits.find(visit => visit.patientId === patient.id);
      const visitCount = visitInfo ? visitInfo._count.patientId : 0;
      
      // Get the most recent condition/diagnosis from last appointment
      const lastCondition = patient.latestAppointment 
        ? patient.latestAppointment.diagnosis || patient.latestAppointment.symptoms || 'General Checkup' 
        : 'Unknown';
      
      return {
        id: patient.id,
        name: patient.user.name,
        image: patient.user.avatar || '/healthcare/avatars/default.jpg',
        condition: lastCondition,
        visitCount
      };
    });
    
    // Sort by visit count in descending order
    formattedPatients.sort((a, b) => b.visitCount - a.visitCount);
    
    return NextResponse.json(formattedPatients);
  } catch (error) {
    console.error('Error fetching frequent patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frequent patients' },
      { status: 500 }
    );
  }
} 