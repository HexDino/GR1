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

    // Build where conditions
    let whereClause: any = { userId };
    
    if (status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    if (category !== 'all') {
      whereClause.category = category.toUpperCase();
    }

    // Fetch health goals from database - use any type casting to avoid linter errors
    // This will be fixed when Prisma client is regenerated with the new model
    const healthGoals = await (prisma as any).healthGoal.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match frontend interface
    const transformedGoals = healthGoals.map((goal: any) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      category: goal.category.toLowerCase(),
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      startDate: goal.startDate.toISOString(),
      deadline: goal.deadline.toISOString(),
      progress: goal.progress,
      status: goal.status.toLowerCase(),
      priority: goal.priority.toLowerCase(),
      notes: goal.notes || undefined,
      milestones: goal.milestones ? JSON.parse(goal.milestones.toString()) : undefined,
      reminder: goal.reminder,
      reminderTime: goal.reminderTime
    }));

    return NextResponse.json({
      success: true,
      goals: transformedGoals
    });
  } catch (error) {
    console.error('Error fetching health goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'target', 'current', 'unit', 'startDate', 'deadline'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw ApiError.badRequest(`Field '${field}' is required`);
      }
    }

    // Create new health goal - use any type casting to avoid linter errors
    // This will be fixed when Prisma client is regenerated with the new model
    const newGoal = await (prisma as any).healthGoal.create({
      data: {
        userId,
        title: body.title,
        description: body.description,
        category: body.category.toUpperCase(),
        target: body.target,
        current: body.current,
        unit: body.unit,
        startDate: new Date(body.startDate),
        deadline: new Date(body.deadline),
        progress: body.progress || 0,
        status: body.status ? body.status.toUpperCase() : 'ACTIVE',
        priority: body.priority ? body.priority.toUpperCase() : 'MEDIUM',
        notes: body.notes,
        milestones: body.milestones ? JSON.stringify(body.milestones) : null,
        reminder: body.reminder || false,
        reminderTime: body.reminderTime
      }
    });

    // Transform to match frontend interface
    const transformedGoal = {
      id: newGoal.id,
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category.toLowerCase(),
      target: newGoal.target,
      current: newGoal.current,
      unit: newGoal.unit,
      startDate: newGoal.startDate.toISOString(),
      deadline: newGoal.deadline.toISOString(),
      progress: newGoal.progress,
      status: newGoal.status.toLowerCase(),
      priority: newGoal.priority.toLowerCase(),
      notes: newGoal.notes || undefined,
      milestones: newGoal.milestones ? JSON.parse(newGoal.milestones.toString()) : undefined,
      reminder: newGoal.reminder,
      reminderTime: newGoal.reminderTime
    };

    return NextResponse.json({
      success: true,
      goal: transformedGoal
    });
  } catch (error) {
    console.error('Error creating health goal:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create health goal' },
      { status: 500 }
    );
  }
} 