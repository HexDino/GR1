import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(req: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build the filter conditions
    const where: any = {
      patientId: userId
    };
    
    // Filter by status if provided and not 'all'
    if (statusParam !== 'all') {
      where.status = statusParam.toUpperCase();
    }
    
    // Use transaction to get appointments and count in a single database operation
    const [appointments, totalAppointments] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: {
            select: {
              name: true,
              avatar: true,
              doctor: {
                select: {
                  specialization: true,
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.appointment.count({ where })
    ]);

    // Format appointment data
    const formattedAppointments = appointments.map(appointment => {
      const appointmentDate = new Date(appointment.date);
      const timeString = appointmentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      return {
        id: appointment.id,
        doctorName: appointment.doctor?.name || 'Unknown Doctor',
        doctorSpecialty: appointment.doctor?.doctor?.specialization || 'Specialist',
        doctorAvatar: appointment.doctor?.avatar,
        date: appointment.date.toISOString(),
        time: timeString,
        status: appointment.status,
        type: appointment.type || 'IN_PERSON',
        symptoms: appointment.symptoms || '',
        formattedDate: appointmentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      };
    });

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
      pagination: {
        page,
        limit,
        totalAppointments,
        totalPages: Math.ceil(totalAppointments / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    
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
        message: 'Failed to fetch appointments',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 