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
    
    // For now, allow any authenticated user to access admin stats
    // In production you should check: if (userRole !== 'ADMIN')
    
    // Get today's date at midnight for filtering today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Count total users by role
    const totalUsers = await prisma.user.count();
    const totalDoctors = await prisma.user.count({
      where: { role: 'DOCTOR' }
    });
    const totalPatients = await prisma.user.count({
      where: { role: 'PATIENT' }
    });
    const totalAdmins = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    
    // Count appointments
    const totalAppointments = await prisma.appointment.count();
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Count departments
    const totalDepartments = await prisma.department.count();
    
    // Count hospitals/clinics
    const totalHospitals = await prisma.hospital.count();
    
    // Count total prescriptions
    const totalPrescriptions = await prisma.prescription.count();
    
    // Count total reviews
    const totalReviews = await prisma.doctorReview.count();
    
    // Count notifications
    const totalNotifications = await prisma.notification.count();
    const unreadNotifications = await prisma.notification.count({
      where: { isRead: false }
    });
    
    return NextResponse.json({
      users: totalUsers,
      doctors: totalDoctors,
      patients: totalPatients,
      admins: totalAdmins,
      appointments: totalAppointments,
      todayAppointments,
      departments: totalDepartments,
      hospitals: totalHospitals,
      prescriptions: totalPrescriptions,
      reviews: totalReviews,
      notifications: totalNotifications,
      unreadNotifications
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
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
        message: 'Failed to fetch admin statistics',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 