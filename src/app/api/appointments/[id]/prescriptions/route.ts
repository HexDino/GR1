import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/types'

const prescriptionItemSchema = z.object({
  medicineId: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
})

const createPrescriptionSchema = z.object({
  items: z.array(prescriptionItemSchema),
  instructions: z.string().optional(),
})

// Get prescriptions for an appointment
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
    // Get appointment with prescriptions
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        prescriptions: {
          include: {
            items: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to view prescriptions
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

    return NextResponse.json(appointment.prescriptions)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create prescription for an appointment
export async function POST(
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
    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Only doctor of the appointment or admin can create prescriptions
    if (auth.userId !== appointment.doctorId && auth.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = createPrescriptionSchema.parse(body)

    // Create prescription with items
    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        diagnosis: "Prescribed based on appointment",
        notes: data.instructions,
        items: {
          create: data.items.map(item => ({
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: 1, // Default quantity
          })),
        },
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
      },
    })

    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: appointment.patientId,
        type: "PRESCRIPTION_REMINDER",
        title: 'New Prescription',
        message: `A new prescription has been added to your appointment`,
      },
    })

    return NextResponse.json(prescription)
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