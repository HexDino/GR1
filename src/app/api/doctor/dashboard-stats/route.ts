import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }

    if (userRole !== 'DOCTOR') {
      throw ApiError.forbidden('Only doctors can access this resource');
    }

    console.log('[DOCTOR STATS API] Fetching dashboard stats for doctor:', userId);

    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch all statistics in parallel
      const [
        todayAppointments,
        totalPatients,
        totalPrescriptions,
        pendingAppointments,
        completedToday,
        reviews
      ] = await Promise.all([
        // Today's appointments count
        prisma.appointment.count({
          where: {
            doctorId: userId,
            date: {
              gte: today,
              lt: tomorrow
            }
          }
        }),

        // Total unique patients count
        prisma.appointment.findMany({
          where: {
            doctorId: userId
          },
          select: {
            patientId: true
          },
          distinct: ['patientId']
        }).then(appointments => appointments.length),

        // Total prescriptions count
        prisma.prescription.count({
          where: {
            doctorId: userId
          }
        }),

        // Pending appointments count
        prisma.appointment.count({
          where: {
            doctorId: userId,
            status: 'PENDING'
          }
        }),

        // Completed appointments today
        prisma.appointment.count({
          where: {
            doctorId: userId,
            status: 'COMPLETED',
            date: {
              gte: today,
              lt: tomorrow
            }
          }
        }),

        // Get reviews for this doctor
        prisma.doctorReview.findMany({
          where: {
            doctorId: userId
          },
          select: {
            rating: true
          }
        })
      ]);

      // Calculate average rating
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length
        : 0;

      const stats = {
        todayAppointments,
        totalPatients,
        totalPrescriptions,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
        pendingAppointments,
        completedToday
      };

      console.log('[DOCTOR STATS API] Stats calculated:', stats);

      return NextResponse.json({
        success: true,
        stats,
        lastUpdated: new Date().toISOString()
      });

    } catch (dbError) {
      console.error('[DOCTOR STATS API] Database error:', dbError);
      
      // Return fallback stats if database fails
      const fallbackStats = {
        todayAppointments: 0,
        totalPatients: 0,
        totalPrescriptions: 0,
        averageRating: 0,
        totalReviews: 0,
        pendingAppointments: 0,
        completedToday: 0
      };

      return NextResponse.json({
        success: true,
        stats: fallbackStats,
        lastUpdated: new Date().toISOString(),
        note: 'Using fallback data due to database connectivity issues'
      });
    }

  } catch (error) {
    console.error('Error fetching doctor dashboard stats:', error);
    
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