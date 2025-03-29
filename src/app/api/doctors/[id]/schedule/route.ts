import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/types'
import { Prisma, PrismaClient } from '@prisma/client'

// TypeScript workaround for new Prisma models
type PrismaClientWithDoctorSchedule = PrismaClient & {
  doctorSchedule: {
    findMany: (args: any) => Promise<any[]>;
    deleteMany: (args: any) => Promise<any>;
    createMany: (args: any) => Promise<any>;
  }
}

const typedPrisma = prisma as PrismaClientWithDoctorSchedule;

const scheduleSchema = z.object({
  weekday: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isAvailable: z.boolean(),
  maxAppointments: z.number().min(1).optional(),
})

type Schedule = z.infer<typeof scheduleSchema>
const updateScheduleSchema = z.array(scheduleSchema)

interface DoctorScheduleType {
  id: string
  doctorId: string
  weekday: number
  startTime: string
  endTime: string
  isAvailable: boolean
  maxAppointments: number
}

interface AppointmentWithTimeSlot {
  id: string
  date: Date
  timeSlot?: string
}

// Rate limiting implementation for Next.js API routes
const rateLimitMemory: Record<string, { count: number; resetTime: number }> = {}

function checkRateLimit(ip: string, limit = 100, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now()
  
  if (!rateLimitMemory[ip] || rateLimitMemory[ip].resetTime < now) {
    rateLimitMemory[ip] = { count: 1, resetTime: now + windowMs }
    return true
  }
  
  if (rateLimitMemory[ip].count >= limit) {
    return false
  }
  
  rateLimitMemory[ip].count += 1
  return true
}

const appointmentSchema = z.object({
  date: z.date(),
  doctorId: z.string(),
  patientId: z.string()
})

// Get doctor's schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      )
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const schedule = await typedPrisma.doctorSchedule.findMany({
      where: { doctorId: id },
      orderBy: [
        { weekday: 'asc' },
        { startTime: 'asc' },
      ],
    })

    return NextResponse.json(schedule)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update doctor's schedule
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

  // Only doctor themselves or admin can update schedule
  if (auth.userId !== id && auth.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const scheduleData = updateScheduleSchema.parse(body)

    // Delete existing schedule
    await typedPrisma.doctorSchedule.deleteMany({
      where: { doctorId: id },
    })

    // Create new schedule entries
    const schedule = await typedPrisma.doctorSchedule.createMany({
      data: scheduleData.map((slot: Schedule) => ({
        doctorId: id,
        weekday: slot.weekday,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
        maxAppointments: slot.maxAppointments ?? 1,
      })),
    })

    return NextResponse.json({
      message: 'Schedule updated successfully',
      count: schedule.count,
    })
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

// Get available time slots for a specific date
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      )
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const body = await request.json()
    const { date } = z.object({
      date: z.string().datetime(),
    }).parse(body)

    const requestDate = new Date(date)
    const weekday = requestDate.getDay() // 0 = Sunday, 6 = Saturday

    // Get doctor's schedule for the weekday
    const schedule = await typedPrisma.doctorSchedule.findMany({
      where: {
        doctorId: id,
        weekday: weekday,
        isAvailable: true,
      },
      orderBy: { startTime: 'asc' },
    })

    // Get existing appointments for the date
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
      select: {
        id: true,
        date: true,
      },
    }) as unknown as AppointmentWithTimeSlot[]

    // Calculate available time slots
    const availableSlots = schedule.flatMap((slot: DoctorScheduleType) => {
      const [startHour, startMinute] = slot.startTime.split(':').map(Number)
      const [endHour, endMinute] = slot.endTime.split(':').map(Number)
      
      const slots = []
      let currentTime = new Date(requestDate)
      currentTime.setHours(startHour, startMinute, 0, 0)
      
      const endTime = new Date(requestDate)
      endTime.setHours(endHour, endMinute, 0, 0)

      // Generate 30-minute slots
      while (currentTime < endTime) {
        const timeSlot = currentTime.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })

        // For now, we're using a custom field in our interface
        // In production, consider adding timeSlot to the Appointment model in Prisma
        const appointmentsInSlot = appointments.filter(
          (app) => app.timeSlot === timeSlot
        ).length

        if (appointmentsInSlot < (slot.maxAppointments ?? 1)) {
          slots.push(timeSlot)
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30)
      }

      return slots
    })

    return NextResponse.json({
      date: requestDate.toISOString().split('T')[0],
      availableSlots,
    })
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