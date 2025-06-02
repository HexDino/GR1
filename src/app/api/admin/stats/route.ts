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
    
    // Only allow ADMIN users to access this endpoint
    if (userRole !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    // Get basic stats counts in parallel
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalPrescriptions,
      // Removed department count as it doesn't exist
    ] = await Promise.all([
      // Count users
      prisma.user.count(),
      
      // Count doctors
      prisma.doctor.count(),
      
      // Count patients
      prisma.patient.count(),
      
      // Count appointments
      prisma.appointment.count(),
      
      // Count completed appointments
      prisma.appointment.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Count pending appointments
      prisma.appointment.count({
        where: { status: 'PENDING' }
      }),
      
      // Count cancelled appointments
      prisma.appointment.count({
        where: { status: 'CANCELLED' }
      }),
      
      // Count prescriptions
      prisma.prescription.count(),
      
      // Count departments - removed as Department model doesn't exist
      // prisma.department.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          doctors: totalDoctors,
          patients: totalPatients
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          pending: pendingAppointments,
          cancelled: cancelledAppointments
        },
        prescriptions: totalPrescriptions,
        // Removed departments count
        // departments: totalDepartments,
      }
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
        message: 'Failed to fetch admin stats',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 