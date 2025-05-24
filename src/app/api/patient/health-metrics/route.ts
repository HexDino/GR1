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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    let daysBack = 30;
    switch (range) {
      case '7d':
        daysBack = 7;
        break;
      case '30d':
        daysBack = 30;
        break;
      case '90d':
        daysBack = 90;
        break;
    }

    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Fetch health metrics from database
    const healthMetrics = await prisma.healthMetric.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: cutoffDate
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Transform to match frontend interface
    const transformedMetrics = healthMetrics.map(metric => ({
      id: metric.id,
      type: metric.type.toLowerCase().replace('_', '_'), // Convert enum to frontend format
      value: metric.value.toString(), // Convert Float to string for frontend
      date: metric.createdAt.toISOString(),
      notes: metric.notes || '',
      status: 'normal' as const // Default since not in schema
    }));

    return NextResponse.json({
      success: true,
      metrics: transformedMetrics
    });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health metrics' },
      { status: 500 }
    );
  }
} 