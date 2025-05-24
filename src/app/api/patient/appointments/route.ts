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
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'upcoming', 'completed', 'cancelled'
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build where clause
    let whereClause: any = {
      patientId: userId
    };
    
    // Filter by status if provided
    if (status === 'upcoming') {
      whereClause.date = { gte: new Date() };
      whereClause.status = { in: ['PENDING', 'CONFIRMED'] };
    } else if (status === 'completed') {
      whereClause.status = 'COMPLETED';
    } else if (status === 'cancelled') {
      whereClause.status = 'CANCELLED';
    }
    
    // Fetch appointments with doctor information
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        doctorRelation: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            },
            department: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        date: status === 'upcoming' ? 'asc' : 'desc'
      },
      take: limit
    });
    
    // Format the response
    const formattedAppointments = appointments.map(appointment => {
      const appointmentDate = new Date(appointment.date);
      const timeString = appointmentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      return {
        id: appointment.id,
        doctorName: appointment.doctorRelation?.user?.name || 'Unknown Doctor',
        doctorSpecialty: appointment.doctorRelation?.specialization || appointment.doctorRelation?.department?.name || 'General',
        doctorAvatar: appointment.doctorRelation?.user?.avatar,
        date: appointment.date.toISOString(),
        time: timeString,
        status: appointment.status,
        type: appointment.type || 'In-person',
        symptoms: appointment.symptoms,
        diagnosis: appointment.diagnosis,
        notes: appointment.notes,
        createdAt: appointment.createdAt.toISOString()
      };
    });
    
    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
      total: appointments.length
    });
    
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    
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