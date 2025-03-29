import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/types'

const updateAppointmentSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().datetime().optional(),
  cancelReason: z.string().optional(),
})

// Get specific appointment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const authResponse = await authenticateRequest(request);
  const responseData = await authResponse.json();
  
  if (responseData.error) {
    return NextResponse.json({ error: responseData.error }, { status: 401 });
  }
  
  const auth = responseData.payload as JWTPayload;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
        doctor: {
          select: {
            name: true,
            email: true,
            phone: true,
            doctor: {
              select: {
                specialization: true,
                experience: true,
              },
            },
          },
        },
        prescriptions: {
          include: {
            items: {
              include: {
                medicine: true,
              },
            },
          },
        },
        review: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to view this appointment
    if (
      auth.userId !== appointment.patientId &&
      auth.userId !== appointment.doctorId &&
      auth.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const authResponse = await authenticateRequest(request);
  const responseData = await authResponse.json();
  
  if (responseData.error) {
    return NextResponse.json({ error: responseData.error }, { status: 401 });
  }
  
  const auth = responseData.payload as JWTPayload;

  try {
    const body = await request.json()
    const data = updateAppointmentSchema.parse(body)

    // Get current appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (
      auth.userId !== appointment.doctorId &&
      auth.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: data.status,
        diagnosis: data.diagnosis,
        notes: data.notes,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
        cancelReason: data.cancelReason,
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    // Create notification for patient
    let notificationType: "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMATION" | "APPOINTMENT_CANCELLATION" | "GENERAL" = "GENERAL";

    if (data.status === "CONFIRMED") {
      notificationType = "APPOINTMENT_CONFIRMATION";
    } else if (data.status === "CANCELLED") {
      notificationType = "APPOINTMENT_CANCELLATION";
    } else if (data.status === "COMPLETED") {
      notificationType = "GENERAL";
    }

    await prisma.notification.create({
      data: {
        userId: appointment.patientId,
        type: notificationType,
        title: `Appointment ${data.status.toLowerCase()}`,
        message: `Your appointment has been ${data.status.toLowerCase()}${
          data.cancelReason ? `: ${data.cancelReason}` : ''
        }`,
      },
    })

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete appointment (only for admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const authResponse = await authenticateRequest(request);
  const responseData = await authResponse.json();
  
  if (responseData.error) {
    return NextResponse.json({ error: responseData.error }, { status: 401 });
  }
  
  const auth = responseData.payload as JWTPayload;

  if (auth.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  try {
    await prisma.appointment.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Appointment deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 