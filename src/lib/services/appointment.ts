import { prisma } from '@/lib/db/prisma'
import { createNotification, NotificationType } from './notification'

// Define types for the appointment with included relations
interface AppointmentBase {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  status: string;
}

interface AppointmentWithRelations extends AppointmentBase {
  doctor: {
    name: string;
  };
  patient?: {
    name: string;
  };
}

/**
 * Sends appointment reminders to patients for upcoming appointments
 * Should be run as a cron job or scheduled task
 */
export async function sendAppointmentReminders() {
  try {
    // Get appointments that are scheduled for the next 24 hours
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    
    const today = new Date()
    
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lte: tomorrow,
        },
        status: 'CONFIRMED',
      },
      include: {
        patient: {
          select: {
            name: true,
          },
        },
        doctor: {
          select: {
            name: true,
          },
        },
      },
    })
    
    // Send reminder notification for each appointment
    const notificationPromises = upcomingAppointments.map((appointment: AppointmentWithRelations) => {
      const appointmentDate = new Date(appointment.date)
      const timeString = appointmentDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      
      return createNotification({
        userId: appointment.patientId,
        title: 'Appointment Reminder',
        message: `You have an appointment with Dr. ${appointment.doctor.name} tomorrow at ${timeString}. Please be on time.`,
        type: NotificationType.APPOINTMENT_REMINDER,
        relatedId: appointment.id,
      })
    })
    
    await Promise.all(notificationPromises)
    
    return {
      success: true,
      count: notificationPromises.length,
    }
  } catch (error) {
    console.error('Error sending appointment reminders:', error)
    throw error
  }
}

/**
 * Sends follow-up notifications after appointments asking for reviews
 * Should be run as a cron job or scheduled task
 */
export async function sendReviewReminders() {
  try {
    // Get completed appointments from yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: yesterday,
          lt: today,
        },
        status: 'COMPLETED',
      },
      include: {
        doctor: {
          select: {
            name: true,
          },
        },
      },
    })
    
    // Send review reminder for each completed appointment
    const notificationPromises = completedAppointments.map((appointment: AppointmentWithRelations) => {
      return createNotification({
        userId: appointment.patientId,
        title: 'How was your appointment?',
        message: `Thank you for visiting Dr. ${appointment.doctor.name}. Please take a moment to leave a review.`,
        type: NotificationType.GENERAL,
        relatedId: appointment.id,
      })
    })
    
    await Promise.all(notificationPromises)
    
    return {
      success: true,
      count: notificationPromises.length,
    }
  } catch (error) {
    console.error('Error sending review reminders:', error)
    throw error
  }
}

/**
 * Checks for missed appointments and marks them accordingly
 * Should be run as a cron job or scheduled task
 */
export async function updateMissedAppointments() {
  try {
    const now = new Date()
    // Look for appointments that were scheduled in the past but still have status CONFIRMED
    const missedAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          lt: now,
        },
        status: 'CONFIRMED',
      },
    })
    
    // Update each appointment status to MISSED
    const updatePromises = missedAppointments.map((appointment: AppointmentBase) => {
      return prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'MISSED' },
      })
    })
    
    await Promise.all(updatePromises)
    
    return {
      success: true,
      count: updatePromises.length,
    }
  } catch (error) {
    console.error('Error updating missed appointments:', error)
    throw error
  }
} 