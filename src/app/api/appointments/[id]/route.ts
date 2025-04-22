import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { Appointment, NotificationType } from '@prisma/client';

// GET endpoint to get appointment details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const payload = await verifyToken(token);
    const userId = payload.userId;
    
    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        role: true,
        patient: { select: { id: true } },
        doctor: { select: { id: true } }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patientRelation: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        doctorRelation: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            },
            department: true
          }
        }
      }
    });
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this appointment
    const hasPermission = 
      user.role === 'ADMIN' || 
      (user.doctor && appointment.doctorId === user.doctor.id) || 
      (user.patient && appointment.patientId === user.patient.id);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Unauthorized to view this appointment' },
        { status: 403 }
      );
    }
    
    // Format appointment details
    const formattedAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      patient: {
        id: appointment.patientRelation?.user.id,
        name: appointment.patientRelation?.user.name,
        email: appointment.patientRelation?.user.email,
        avatar: appointment.patientRelation?.user.avatar
      },
      doctor: {
        id: appointment.doctorRelation?.user.id,
        name: appointment.doctorRelation?.user.name,
        email: appointment.doctorRelation?.user.email,
        specialty: appointment.doctorRelation?.specialization,
        department: appointment.doctorRelation?.department?.name || null,
        avatar: appointment.doctorRelation?.user.avatar
      },
      date: appointment.date.toISOString(),
      formattedDate: appointment.date.toLocaleDateString(),
      formattedTime: appointment.date.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      }),
      status: appointment.status,
      type: appointment.type,
      symptoms: appointment.symptoms,
      diagnosis: appointment.diagnosis,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    };
    
    // Add prescription field if it exists
    if ('prescription' in appointment) {
      // @ts-ignore
      formattedAppointment.prescription = appointment.prescription || null;
    }
    
    return NextResponse.json(formattedAppointment);
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment details' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update appointment
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const payload = await verifyToken(token);
    const userId = payload.userId;
    
    // Parse request body
    const body = await req.json();
    
    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        role: true,
        patient: { select: { id: true } },
        doctor: { select: { id: true } }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patientRelation: {
          select: {
            userId: true
          }
        },
        doctorRelation: {
          select: {
            userId: true
          }
        }
      }
    });
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to update this appointment
    let hasPermission = user.role === 'ADMIN';
    let canUpdateMedicalDetails = false;
    
    if (user.doctor && appointment.doctorId === user.doctor.id) {
      hasPermission = true;
      canUpdateMedicalDetails = true;
    } else if (user.patient && appointment.patientId === user.patient.id) {
      // Patients can only update certain fields and only if appointment is in certain states
      hasPermission = ['PENDING', 'CONFIRMED'].includes(appointment.status);
      
      // Remove fields patients cannot update
      delete body.diagnosis;
      delete body.prescription;
    }
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Unauthorized to update this appointment' },
        { status: 403 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Status update
    if (body.status) {
      // Status validation
      const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }
      
      // Check status transition rules
      if (body.status === 'CONFIRMED') {
        // Only doctors and admins can confirm appointments
        if (user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Only doctors or admins can confirm appointments' },
            { status: 403 }
          );
        }
      } else if (body.status === 'COMPLETED') {
        // Only doctors and admins can mark appointments as completed
        if (user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Only doctors or admins can complete appointments' },
            { status: 403 }
          );
        }
        
        // Can only complete appointments that were confirmed
        if (appointment.status !== 'CONFIRMED') {
          return NextResponse.json(
            { error: 'Only confirmed appointments can be marked as completed' },
            { status: 400 }
          );
        }
      }
      
      updateData.status = body.status;
    }
    
    // Date update - check availability and conflicts
    if (body.date) {
      // Only allow date changes for pending or confirmed appointments
      if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
        return NextResponse.json(
          { error: 'Cannot reschedule completed or cancelled appointments' },
          { status: 400 }
        );
      }
      
      const newDate = new Date(body.date);
      
      // Check if date is in the past
      if (newDate < new Date()) {
        return NextResponse.json(
          { error: 'Appointment date cannot be in the past' },
          { status: 400 }
        );
      }
      
      // Get the day of week (0-6)
      const dayOfWeek = newDate.getDay();
      
      // Get the time in HH:MM format
      const hours = newDate.getHours().toString().padStart(2, '0');
      const minutes = newDate.getMinutes().toString().padStart(2, '0');
      const appointmentTime = `${hours}:${minutes}`;
      
      // Check if doctor has a schedule for this day
      const doctorSchedule = await prisma.doctorSchedule.findFirst({
        where: {
          doctorId: appointment.doctorId,
          weekday: dayOfWeek,
          isAvailable: true,
          startTime: { lte: appointmentTime },
          endTime: { gte: appointmentTime }
        }
      });
      
      if (!doctorSchedule) {
        return NextResponse.json(
          { error: 'Doctor is not available at the requested time' },
          { status: 400 }
        );
      }
      
      // Check for scheduling conflicts
      // Get start and end time of the appointment (assuming 1 hour duration)
      const appointmentStart = new Date(newDate);
      const appointmentEnd = new Date(newDate);
      appointmentEnd.setHours(appointmentEnd.getHours() + 1);
      
      // Check if doctor already has an appointment at this time (excluding this appointment)
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: appointmentId },
          doctorId: appointment.doctorId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          date: {
            gte: appointmentStart,
            lt: appointmentEnd
          }
        }
      });
      
      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'Doctor already has an appointment at this time' },
          { status: 409 }
        );
      }
      
      updateData.date = newDate;
    }
    
    // Other fields updates
    if (body.type) updateData.type = body.type;
    if (body.symptoms) updateData.symptoms = body.symptoms;
    if (body.notes) updateData.notes = body.notes;
    
    // Doctor-only updates
    if (canUpdateMedicalDetails) {
      if (body.diagnosis) updateData.diagnosis = body.diagnosis;
      if (body.prescription) updateData.prescription = body.prescription;
    }
    
    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData
    });
    
    // Create notifications based on the update
    if (body.status) {
      let patientNotification = null;
      let doctorNotification = null;
      
      switch (body.status) {
        case 'CONFIRMED':
          if (appointment.patientRelation) {
            patientNotification = {
              userId: appointment.patientRelation.userId,
              type: 'APPOINTMENT_CONFIRMATION' as NotificationType,
              title: 'Appointment Confirmed',
              message: `Your appointment on ${updatedAppointment.date.toLocaleDateString()} at ${updatedAppointment.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })} has been confirmed.`,
              isRead: false
            };
          }
          break;
        case 'CANCELLED':
          // Notify the other party about cancellation
          if (user.patient && appointment.patientId === user.patient.id && appointment.doctorRelation) {
            doctorNotification = {
              userId: appointment.doctorRelation.userId,
              type: 'APPOINTMENT_CANCELLATION' as NotificationType,
              title: 'Appointment Cancelled',
              message: `The appointment on ${updatedAppointment.date.toLocaleDateString()} has been cancelled by the patient.`,
              isRead: false
            };
          } else if (appointment.patientRelation) {
            patientNotification = {
              userId: appointment.patientRelation.userId,
              type: 'APPOINTMENT_CANCELLATION' as NotificationType,
              title: 'Appointment Cancelled',
              message: `Your appointment on ${updatedAppointment.date.toLocaleDateString()} has been cancelled.`,
              isRead: false
            };
          }
          break;
        case 'COMPLETED':
          if (appointment.patientRelation) {
            patientNotification = {
              userId: appointment.patientRelation.userId,
              type: 'APPOINTMENT_COMPLETION' as NotificationType,
              title: 'Appointment Completed',
              message: `Your appointment on ${updatedAppointment.date.toLocaleDateString()} has been marked as completed.`,
              isRead: false
            };
          }
          break;
      }
      
      // Create notifications
      if (patientNotification) {
        await prisma.notification.create({
          data: patientNotification
        });
      }
      
      if (doctorNotification) {
        await prisma.notification.create({
          data: doctorNotification
        });
      }
    }
    
    // If date is updated, notify both parties
    if (body.date && body.date !== appointment.date.toISOString()) {
      // Notify patient
      if (appointment.patientRelation) {
        await prisma.notification.create({
          data: {
            userId: appointment.patientRelation.userId,
            type: 'APPOINTMENT_RESCHEDULED' as NotificationType,
            title: 'Appointment Rescheduled',
            message: `Your appointment has been rescheduled to ${new Date(body.date).toLocaleDateString()} at ${new Date(body.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}.`,
            isRead: false
          }
        });
      }
      
      // Notify doctor
      if (appointment.doctorRelation) {
        await prisma.notification.create({
          data: {
            userId: appointment.doctorRelation.userId,
            type: 'APPOINTMENT_RESCHEDULED' as NotificationType,
            title: 'Appointment Rescheduled',
            message: `The appointment has been rescheduled to ${new Date(body.date).toLocaleDateString()} at ${new Date(body.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}.`,
            isRead: false
          }
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      appointment: {
        id: updatedAppointment.id,
        date: updatedAppointment.date.toISOString(),
        status: updatedAppointment.status,
        type: updatedAppointment.type,
        updatedAt: updatedAppointment.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete an appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const payload = await verifyToken(token);
    const userId = payload.userId;
    
    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        role: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Only admins can delete appointments
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can delete appointments' },
        { status: 403 }
      );
    }
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Delete the appointment
    await prisma.appointment.delete({
      where: { id: appointmentId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Appointment successfully deleted'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
} 