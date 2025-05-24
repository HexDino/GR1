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
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    // Calculate health score based on available data
    // This is a simplified calculation - in real world would be more complex
    let score = 0;

    // Check recent health metrics (last 30 days)
    const recentMetrics = await prisma.healthMetric.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Check appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        patientId: userId,
        status: 'COMPLETED',
        date: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Simple scoring logic
    if (recentMetrics.length > 0) {
      score += 30; // Has recent health data
    }

    if (recentAppointments.length > 0) {
      score += 25; // Has recent medical care
    }

    // Base health score
    score += 20;

    // Cap at 100
    score = Math.min(score, 100);

    return NextResponse.json({
      success: true,
      score: score
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate health score' },
      { status: 500 }
    );
  }
} 