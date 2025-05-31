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
    
    // Get today's date at midnight for filtering today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get last month's date
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Use transaction to execute all queries in a single database operation
    const [
      totalUsers,
      totalDoctors, 
      totalPatients,
      activeUsers,
      totalAppointments,
      pendingAppointments,
      totalDepartments,
      recentLogins,
      recentAppointments
    ] = await prisma.$transaction([
      // Count total users by role
      prisma.user.count(),
      prisma.user.count({
        where: { role: 'DOCTOR' }
      }),
      prisma.user.count({
        where: { role: 'PATIENT' }
      }),
      
      // Count active users (users who have logged in recently)
      prisma.user.count({
        where: {
          sessions: {
            some: {
              updatedAt: {
                gte: lastMonth
              }
            }
          }
        }
      }),
      
      // Count appointments
      prisma.appointment.count(),
      
      // Count pending appointments
      prisma.appointment.count({
        where: {
          status: 'PENDING'
        }
      }),
      
      // Count departments
      prisma.department.count(),
      
      // Get recent user activity (recent logins, registrations, etc.)
      prisma.loginHistory.findMany({
        where: {
          status: 'SUCCESS',
          createdAt: {
            gte: lastMonth
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          }
        }
      }),
      
      // Get recent appointments
      prisma.appointment.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  name: true,
                }
              }
            }
          },
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                }
              }
            }
          }
        }
      })
    ]);

    // Get payment data for revenue calculation (use a default value if Payment table doesn't exist)
    let totalRevenue = 0;
    try {
      // Check if the Payment table exists in the database schema
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'Payment'
        );
      `;
      
      // If table exists, query it
      if (tableExists) {
        const payments = await prisma.$queryRaw<PaymentData[]>`
          SELECT SUM(amount) as amount FROM "Payment" 
          WHERE status = 'COMPLETED' 
          AND "createdAt" >= ${new Date(new Date().setMonth(new Date().getMonth() - 12))}
        `;
        totalRevenue = payments[0]?.amount || 0;
      } else {
        console.log('[DASHBOARD STATS] Payment table does not exist, using default revenue value');
        // Use a mock value if Payment table doesn't exist
        totalRevenue = 0;
      }
    } catch (error) {
      console.error('[DASHBOARD STATS] Error querying payments:', error);
      // Use a default value if there's an error
      totalRevenue = 0;
    }

    // Format activities
    const recentActivities: Activity[] = [
      ...recentLogins.map(login => ({
        id: login.id,
        type: 'user_login',
        user: login.user.name,
        time: login.createdAt,
        role: login.user.role
      })),
      ...recentAppointments.map(appointment => ({
        id: appointment.id,
        type: 'appointment_created',
        user: appointment.doctor.user.name,
        patient: appointment.patient.user.name,
        time: appointment.createdAt
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 7);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        pendingAppointments,
        totalRevenue,
        activeUsers,
        totalDepartments
      },
      recentActivities
    });
    
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    
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
        message: 'Failed to fetch admin dashboard statistics',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 