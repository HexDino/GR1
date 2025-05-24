import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    const { id: appointmentId } = await params;

    // Fetch appointment with doctor information
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: userId
      },
      include: {
        doctorRelation: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
                email: true,
                phone: true
              }
            },
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!appointment) {
      throw ApiError.notFound('Appointment not found');
    }

    // Format the response
    const appointmentDate = new Date(appointment.date);
    const timeString = appointmentDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    const formattedAppointment = {
      id: appointment.id,
      doctorName: appointment.doctorRelation?.user?.name || 'Unknown Doctor',
      doctorSpecialty: appointment.doctorRelation?.specialization || appointment.doctorRelation?.department?.name || 'General',
      doctorAvatar: appointment.doctorRelation?.user?.avatar,
      doctorEmail: appointment.doctorRelation?.user?.email,
      doctorPhone: appointment.doctorRelation?.user?.phone,
      date: appointment.date.toISOString(),
      time: timeString,
      status: appointment.status,
      type: appointment.type || 'In-person',
      symptoms: appointment.symptoms,
      diagnosis: appointment.diagnosis,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      formattedDate: appointmentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      formattedTime: timeString
    };

    return NextResponse.json(formattedAppointment);
    
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    
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
        message: 'Failed to fetch appointment details',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    const { id: appointmentId } = await params;
    const { status } = await req.json();

    // Validate that the appointment belongs to the patient
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: userId
      }
    });

    if (!existingAppointment) {
      throw ApiError.notFound('Appointment not found');
    }

    // Only allow patients to cancel appointments
    if (status && status !== 'CANCELLED') {
      throw ApiError.forbidden('Patients can only cancel appointments');
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    
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
        message: 'Failed to update appointment',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 