import { NextRequest, NextResponse } from 'next/server';
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
    
    // In a real application, you would fetch real system metrics here
    // For now, we'll return some simulated system health data
    const systemHealth = {
      serverStatus: 'Online',
      serverLoad: 42, // percentage
      databaseLoad: 28, // percentage
      memoryUsage: 35, // percentage
      storageUsage: 45, // percentage
      lastRestart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      activeSessions: 18,
      avgResponseTime: 120, // ms
      errors24h: 3,
    };
    
    return NextResponse.json({
      success: true,
      health: systemHealth
    });
    
  } catch (error) {
    console.error('Error fetching system health stats:', error);
    
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
        message: 'Failed to fetch system health statistics',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 