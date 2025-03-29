import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/types'
import { createNotification, NotificationType } from '@/lib/services/notification'

const appointmentSchema = z.object({
  doctorId: z.string(),
  date: z.string().datetime(),
  reason: z.string(),
  type: z.enum(['IN_PERSON', 'VIRTUAL', 'HOME_VISIT']),
  notes: z.string().optional(),
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Lấy danh sách lịch hẹn với phân trang và lọc
 */
export async function GET(request: NextRequest) {
  const authResponse = await authenticateRequest(request);
  const responseData = await authResponse.json();
  
  if (responseData.error) {
    return NextResponse.json({ error: responseData.error }, { status: 401 });
  }
  
  const auth = responseData.payload as JWTPayload;

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on filters and user role
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (from) {
      where.date = {
        ...where.date,
        gte: new Date(from),
      }
    }

    if (to) {
      where.date = {
        ...where.date,
        lte: new Date(to),
      }
    }

    // Apply role-based filters
    if (auth.role === 'PATIENT') {
      where.patientId = auth.userId
    } else if (auth.role === 'DOCTOR') {
      where.doctorId = auth.userId
    } else {
      // Admin can filter by doctor or patient
      if (doctorId) {
        where.doctorId = doctorId
      }
      if (patientId) {
        where.patientId = patientId
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.appointment.count({ where })

    // Get appointments with pagination
    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        doctor: {
          select: {
            name: true,
            email: true,
          },
        },
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      data: appointments,
      meta: {
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Tạo lịch hẹn mới
 */
export async function POST(request: NextRequest) {
  const authResponse = await authenticateRequest(request);
  const responseData = await authResponse.json();
  
  if (responseData.error) {
    return NextResponse.json({ error: responseData.error }, { status: 401 });
  }
  
  const auth = responseData.payload as JWTPayload;

  try {
    const body = await request.json()
    const data = appointmentSchema.parse(body)

    // Kiểm tra liệu bác sĩ có lịch làm việc vào thời điểm này không
    const appointmentDate = new Date(data.date)
    
    // Kiểm tra xem bác sĩ có lịch trống vào thời điểm này không
    const doctor = await prisma.doctor.findUnique({
      where: { userId: data.doctorId },
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Kiểm tra lịch làm việc của bác sĩ
    const doctorSchedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId: doctor.id,
        dayOfWeek: appointmentDate.getDay(),
        startTime: {
          lte: `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`
        },
        endTime: {
          gte: `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`
        },
      },
    })

    if (!doctorSchedule) {
      return NextResponse.json(
        { error: 'Doctor is not available at this time' },
        { status: 400 }
      )
    }

    // Kiểm tra xem bác sĩ đã có lịch hẹn vào thời điểm này chưa
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: appointmentDate,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Doctor already has an appointment at this time' },
        { status: 400 }
      )
    }

    // Tạo lịch hẹn mới
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: data.doctorId,
        patientId: auth.userId,
        date: appointmentDate,
        reason: data.reason,
        type: data.type,
        notes: data.notes,
        status: 'PENDING',
      },
    })

    // Tạo thông báo cho bác sĩ
    await createNotification({
      userId: data.doctorId,
      title: 'New Appointment Request',
      message: `You have a new appointment request from ${auth.email} on ${appointmentDate.toLocaleString()}`,
      type: NotificationType.NEW_APPOINTMENT,
      relatedId: appointment.id,
    })

    return NextResponse.json(appointment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 