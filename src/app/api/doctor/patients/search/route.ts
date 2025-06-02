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
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    // For all doctors, search in the database
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
    
    // Get all patients who have had appointments with this doctor
    const patientIds = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
      },
      select: {
        patientId: true
      },
      distinct: ['patientId']
    });
    
    const patientIdList = patientIds.map(p => p.patientId);
    
    // Search patients based on the query
    const patients = await prisma.patient.findMany({
      where: {
        id: {
          in: patientIdList
        },
        OR: query ? [
          {
            user: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              email: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              phone: {
                contains: query
              }
            }
          }
        ] : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      }
    });
    
    // Get last appointment for each patient
    const patientLastAppointments = await Promise.all(
      patients.map(async (patient) => {
        const lastAppointment = await prisma.appointment.findFirst({
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
          lastAppointment
        };
      })
    );
    
    // Get next upcoming appointment for each patient
    const patientNextAppointments = await prisma.appointment.findMany({
      where: {
        patientId: {
          in: patients.map(p => p.id)
        },
        doctorId: doctor.id,
        date: {
          gt: new Date()
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      orderBy: {
        date: 'asc'
      },
      distinct: ['patientId']
    });
    
    // Format response
    const formattedPatients = patientLastAppointments.map(patient => {
      // Get the condition from last appointment
      const lastAppointment = patient.lastAppointment;
      const condition = lastAppointment 
        ? lastAppointment.diagnosis || lastAppointment.symptoms || 'General Checkup'
        : 'Unknown';
      
      // Find the next appointment
      const nextAppointment = patientNextAppointments.find(
        appointment => appointment.patientId === patient.id
      );
      
      const nextAppointmentStr = nextAppointment 
        ? `${nextAppointment.date.toISOString().split('T')[0]} ${nextAppointment.date.toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true
          })}`
        : null;
      
      return {
        id: patient.id,
        name: patient.user.name,
        email: patient.user.email,
        phone: patient.user.phone || 'Not provided',
        gender: patient.gender || 'Not specified',
        condition,
        lastVisit: lastAppointment ? lastAppointment.date.toISOString().split('T')[0] : 'Never',
        nextAppointment: nextAppointmentStr
      };
    });
    
    return NextResponse.json(formattedPatients);
  } catch (error) {
    console.error('Error searching patients:', error);
    return NextResponse.json(
      { error: 'Failed to search patients' },
      { status: 500 }
    );
  }
} 