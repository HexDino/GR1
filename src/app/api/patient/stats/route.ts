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
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }
    
    // Get today's date at midnight for filtering today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get one week from now for upcoming appointments
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    // Count upcoming appointments (from today onwards)
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        patientId: userId,
        date: {
          gte: today
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });
    
    // Count total appointments
    const totalAppointments = await prisma.appointment.count({
      where: {
        patientId: userId
      }
    });
    
    // Count total prescriptions
    const totalPrescriptions = await prisma.prescription.count({
      where: {
        patientId: userId
      }
    });
    
    // Count active prescriptions
    const activePrescriptions = await prisma.prescription.count({
      where: {
        patientId: userId,
        status: 'ACTIVE'
      }
    });
    
    // Count total doctors visited
    const totalDoctors = await prisma.appointment.groupBy({
      by: ['doctorId'],
      where: {
        patientId: userId,
        status: 'COMPLETED'
      }
    });
    
    // Get average doctor rating from reviews
    const avgRating = await prisma.doctorReview.aggregate({
      where: {
        appointment: {
          patientId: userId
        }
      },
      _avg: {
        rating: true
      }
    });
    
    // Count unread notifications
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });
    
    // Count new messages (assuming we have a chat system)
    const newMessages = await prisma.chat.count({
      where: {
        userId: userId,
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      upcomingAppointments,
      totalAppointments,
      totalPrescriptions,
      activePrescriptions,
      totalDoctors: totalDoctors.length,
      averageDoctorRating: avgRating._avg?.rating || 0,
      unreadNotifications,
      newMessages
    });
    
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    
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
        message: 'Failed to fetch patient statistics',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 