import { prisma } from '@/lib/db/prisma'
import { createNotification, NotificationType } from './notification'

// Định nghĩa types cho appointment với các mối quan hệ được include
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
 * Gửi nhắc nhở lịch hẹn cho bệnh nhân về các cuộc hẹn sắp tới
 * Nên chạy như một cron job hoặc scheduled task
 */
export async function sendAppointmentReminders() {
  try {
    // Lấy các cuộc hẹn được lên lịch trong 24 giờ tới
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
    
    // Gửi thông báo nhắc nhở cho mỗi cuộc hẹn
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
 * Gửi thông báo theo dõi sau cuộc hẹn yêu cầu đánh giá
 * Nên chạy như một cron job hoặc scheduled task
 */
export async function sendReviewReminders() {
  try {
    // Lấy các cuộc hẹn đã hoàn thành từ hôm qua
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
    
    // Gửi nhắc nhở đánh giá cho mỗi cuộc hẹn đã hoàn thành
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
 * Kiểm tra các cuộc hẹn bị bỏ lỡ và đánh dấu tương ứng
 * Nên chạy như một cron job hoặc scheduled task
 */
export async function updateMissedAppointments() {
  try {
    const now = new Date()
    // Tìm các cuộc hẹn đã được lên lịch trong quá khứ nhưng vẫn có trạng thái CONFIRMED
    const missedAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          lt: now,
        },
        status: 'CONFIRMED',
      },
    })
    
    // Cập nhật trạng thái của mỗi cuộc hẹn thành MISSED
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