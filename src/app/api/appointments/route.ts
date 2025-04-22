import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

// GET endpoint to list appointments
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
    const userId = payload.userId;
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prepare filter
    const filter: any = {};
    
    // Add status filter if provided
    if (statusFilter) {
      filter.status = statusFilter.toUpperCase();
    }
    
    // Add date range filters if provided
    if (fromDate) {
      filter.date = {
        ...(filter.date || {}),
        gte: new Date(fromDate)
      };
    }
    
    if (toDate) {
      filter.date = {
        ...(filter.date || {}),
        lte: new Date(toDate)
      };
    }
    
    // Add user specific filter based on role
    if (user.role === 'PATIENT') {
      filter.patientId = userId;
    } else if (user.role === 'DOCTOR') {
      filter.doctorId = userId;
    }
    
    // Query appointments
    const appointments = await prisma.appointment.findMany({
      where: filter,
      include: {
        patientRelation: {
          include: {
            user: {
              select: {
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
                name: true,
                email: true,
                avatar: true
              }
            },
            department: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Format appointments
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      patientName: appointment.patientRelation?.user.name,
      patientEmail: appointment.patientRelation?.user.email,
      patientAvatar: appointment.patientRelation?.user.avatar,
      doctorName: appointment.doctorRelation?.user.name,
      doctorSpecialty: appointment.doctorRelation?.specialization,
      doctorDepartment: appointment.doctorRelation?.department?.name || null,
      doctorAvatar: appointment.doctorRelation?.user.avatar,
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
      notes: appointment.notes
    }));
    
    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new appointment
export async function POST(req: NextRequest) {
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
    const userId = payload.userId;
    
    // Parse request body
    const body = await req.json();
    
    // Basic validation
    if (!body.doctorId || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, date' },
        { status: 400 }
      );
    }
    
    // Get appointment date
    const appointmentDate = new Date(body.date);
    
    // Check if date is in the past
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { error: 'Appointment date cannot be in the past' },
        { status: 400 }
      );
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        role: true,
        doctor: { select: { id: true } },
        patient: { select: { id: true } }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Determine patientId and doctorId
    let patientId: string;
    let doctorId = body.doctorId;
    
    if (user.role === 'PATIENT') {
      // Patient is creating appointment for themselves
      if (!user.patient) {
        return NextResponse.json(
          { error: 'Patient profile not found' },
          { status: 404 }
        );
      }
      patientId = user.patient.id;
    } else if (user.role === 'DOCTOR') {
      // Doctor is creating appointment for a patient
      if (!body.patientId) {
        return NextResponse.json(
          { error: 'Missing required field: patientId' },
          { status: 400 }
        );
      }
      patientId = body.patientId;
      
      // If doctor is creating for themselves, use their doctor ID
      if (body.doctorId === userId && user.doctor) {
        doctorId = user.doctor.id;
      }
    } else if (user.role === 'ADMIN') {
      // Admin can create appointments for any patient and doctor
      if (!body.patientId) {
        return NextResponse.json(
          { error: 'Missing required field: patientId' },
          { status: 400 }
        );
      }
      patientId = body.patientId;
    } else {
      return NextResponse.json(
        { error: 'Unauthorized to create appointments' },
        { status: 403 }
      );
    }
    
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Check doctor availability at the requested time
    // Get the day of week (0-6)
    const dayOfWeek = appointmentDate.getDay();
    
    // Get the time in HH:MM format
    const hours = appointmentDate.getHours().toString().padStart(2, '0');
    const minutes = appointmentDate.getMinutes().toString().padStart(2, '0');
    const appointmentTime = `${hours}:${minutes}`;
    
    // Check if doctor has a schedule for this day
    const doctorSchedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId: doctorId,
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
    const appointmentStart = new Date(appointmentDate);
    const appointmentEnd = new Date(appointmentDate);
    appointmentEnd.setHours(appointmentEnd.getHours() + 1);
    
    // Check if doctor already has an appointment at this time
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
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
    
    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientId,
        doctorId: doctorId,
        date: appointmentDate,
        status: 'PENDING',
        type: body.type || 'IN_PERSON',
        symptoms: body.symptoms || null,
        notes: body.notes || null
      }
    });
    
    // Create notification for doctor
    await prisma.notification.create({
      data: {
        userId: doctor.userId,
        type: 'APPOINTMENT_CONFIRMATION',
        title: 'New Appointment Request',
        message: `You have a new appointment request on ${appointmentDate.toLocaleDateString()} at ${appointmentTime}.`,
        isRead: false
      }
    });
    
    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: 'APPOINTMENT_CONFIRMATION',
        title: 'Appointment Requested',
        message: `Your appointment request for ${appointmentDate.toLocaleDateString()} at ${appointmentTime} has been submitted and is awaiting confirmation.`,
        isRead: false
      }
    });
    
    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        date: appointment.date.toISOString(),
        status: appointment.status,
        type: appointment.type
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
} 