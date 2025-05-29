import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    const goalId = params.id;

    // Fetch the health goal - use any type casting to avoid linter errors
    // This will be fixed when Prisma client is regenerated with the new model
    const goal = await (prisma as any).healthGoal.findUnique({
      where: {
        id: goalId,
      },
    });

    if (!goal) {
      throw ApiError.notFound('Health goal not found');
    }

    // Check if the goal belongs to the user
    if (goal.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to access this goal');
    }

    // Transform to match frontend interface
    const transformedGoal = {
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
    };

    return NextResponse.json({
      success: true,
      goal: transformedGoal,
    });
  } catch (error) {
    console.error('Error fetching health goal:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health goal' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    const goalId = params.id;
    const body = await request.json();

    // Check if goal exists and belongs to user - use any type casting to avoid linter errors
    const existingGoal = await (prisma as any).healthGoal.findUnique({
      where: {
        id: goalId,
      },
    });

    if (!existingGoal) {
      throw ApiError.notFound('Health goal not found');
    }

    if (existingGoal.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to update this goal');
    }

    // Prepare update data
    const updateData: any = {};
    
    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category.toUpperCase();
    if (body.target !== undefined) updateData.target = body.target;
    if (body.current !== undefined) updateData.current = body.current;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.deadline !== undefined) updateData.deadline = new Date(body.deadline);
    if (body.progress !== undefined) updateData.progress = body.progress;
    if (body.status !== undefined) updateData.status = body.status.toUpperCase();
    if (body.priority !== undefined) updateData.priority = body.priority.toUpperCase();
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.milestones !== undefined) updateData.milestones = JSON.stringify(body.milestones);
    if (body.reminder !== undefined) updateData.reminder = body.reminder;
    if (body.reminderTime !== undefined) updateData.reminderTime = body.reminderTime;

    // Update the goal - use any type casting to avoid linter errors
    const updatedGoal = await (prisma as any).healthGoal.update({
      where: {
        id: goalId,
      },
      data: updateData,
    });

    // Transform to match frontend interface
    const transformedGoal = {
      id: updatedGoal.id,
      title: updatedGoal.title,
      description: updatedGoal.description,
      category: updatedGoal.category.toLowerCase(),
      target: updatedGoal.target,
      current: updatedGoal.current,
      unit: updatedGoal.unit,
      startDate: updatedGoal.startDate.toISOString(),
      deadline: updatedGoal.deadline.toISOString(),
      progress: updatedGoal.progress,
      status: updatedGoal.status.toLowerCase(),
      priority: updatedGoal.priority.toLowerCase(),
      notes: updatedGoal.notes || undefined,
      milestones: updatedGoal.milestones ? JSON.parse(updatedGoal.milestones.toString()) : undefined,
      reminder: updatedGoal.reminder,
      reminderTime: updatedGoal.reminderTime
    };

    return NextResponse.json({
      success: true,
      goal: transformedGoal,
    });
  } catch (error) {
    console.error('Error updating health goal:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update health goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    const goalId = params.id;

    // Check if goal exists and belongs to user - use any type casting to avoid linter errors
    const existingGoal = await (prisma as any).healthGoal.findUnique({
      where: {
        id: goalId,
      },
    });

    if (!existingGoal) {
      throw ApiError.notFound('Health goal not found');
    }

    if (existingGoal.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this goal');
    }

    // Delete the goal - use any type casting to avoid linter errors
    await (prisma as any).healthGoal.delete({
      where: {
        id: goalId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Health goal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting health goal:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete health goal' },
      { status: 500 }
    );
  }
} 