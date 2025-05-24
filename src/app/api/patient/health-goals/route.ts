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
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';

    // Build where conditions - health goals would need a proper table
    // For now, return empty array since there's no HealthGoal model in schema
    const goals: any[] = [];

    return NextResponse.json({
      success: true,
      goals: goals
    });
  } catch (error) {
    console.error('Error fetching health goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health goals' },
      { status: 500 }
    );
  }
} 