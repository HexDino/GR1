import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

interface PaymentData {
  amount: number;
}

interface Activity {
  id: string;
  type: string;
  user: string;
  time: Date;
  role?: string;
  patient?: string;
}

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
    
    // Get today's date at midnight for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get current month start and end
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Get date range for time period stats
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get counts for main metrics
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      appointmentsToday,
      appointmentsThisMonth,
      pendingAppointments,
      completedAppointments,
      totalPrescriptions,
      recentUsers,
      recentDoctors,
      recentAppointments
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      
      // Today's appointments
      prisma.appointment.count({
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // This month's appointments
      prisma.appointment.count({
        where: {
          date: {
            gte: currentMonthStart,
            lt: nextMonthStart
          }
        }
      }),
      
      // Pending appointments
      prisma.appointment.count({
        where: {
          status: 'PENDING'
        }
      }),
      
      // Completed appointments
      prisma.appointment.count({
        where: {
          status: 'COMPLETED'
        }
      }),
      
      // Total prescriptions
      prisma.prescription.count(),
      
      // Recent users
      prisma.user.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true
        }
      }),
      
      // Recent doctors
      prisma.doctor.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
      
      // Recent appointments
      prisma.appointment.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        include: {
          patient: {
            select: {
              name: true
            }
          },
          doctor: {
            select: {
              name: true
            }
          }
        }
      })
    ]);
    
    // Format the doctor data
    const formattedDoctors = recentDoctors.map(doctor => ({
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      avatar: doctor.user.avatar,
      specialization: doctor.specialization,
      createdAt: doctor.createdAt
    }));
    
    // Format the appointment data
    const formattedAppointments = recentAppointments.map(appointment => ({
      id: appointment.id,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      date: appointment.date.toISOString(),
      status: appointment.status,
      createdAt: appointment.createdAt.toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      stats: {
        counts: {
          users: totalUsers,
          doctors: totalDoctors,
          patients: totalPatients,
          appointments: totalAppointments,
          pendingAppointments,
          completedAppointments,
          prescriptions: totalPrescriptions,
        },
        today: {
          appointments: appointmentsToday
        },
        thisMonth: {
          appointments: appointmentsThisMonth
        }
      },
      recentData: {
        users: recentUsers,
        doctors: formattedDoctors,
        appointments: formattedAppointments
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
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
        message: 'Failed to fetch dashboard statistics',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 