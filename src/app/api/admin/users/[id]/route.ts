import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const id = params.id;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true }
    });
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    // Prevent admin from deleting themselves
    if (user.id === userId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }
    
    // Instead of permanent deletion, you might want to deactivate the user
    // This preserves data integrity for related records
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        accountLocked: true,
      }
    });
    
    // Alternatively, for permanent deletion (use with caution):
    // await prisma.user.delete({
    //   where: { id }
    // });
    
    return NextResponse.json({
      success: true,
      message: `User ${user.name} has been deactivated`
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    
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
        message: 'Failed to delete user',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const id = params.id;
    
    // Get detailed user information
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        accountLocked: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        doctor: {
          include: {
            department: true,
            hospital: true,
          }
        },
        patient: true,
        profile: true,
        sessions: {
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1,
          select: {
            updatedAt: true,
            ipAddress: true,
            userAgent: true
          }
        },
        loginHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
          select: {
            createdAt: true,
            ipAddress: true,
            userAgent: true,
            status: true
          }
        }
      }
    });
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    // Format user status
    const status = user.accountLocked ? 'blocked' : 
                  !user.isEmailVerified ? 'pending' : 
                  user.isActive ? 'active' : 'inactive';
    
    // Format the response
    const formattedUser = {
      ...user,
      status,
      lastActive: user.sessions[0]?.updatedAt || null,
      lastIp: user.sessions[0]?.ipAddress || null,
      loginHistory: user.loginHistory,
    };
    
    return NextResponse.json({
      success: true,
      user: formattedUser
    });
    
  } catch (error) {
    console.error('Error fetching user details:', error);
    
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
        message: 'Failed to fetch user details',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const id = params.id;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    // Get request body
    const data = await req.json();
    
    // Validate the data
    if (!data) {
      throw ApiError.badRequest('No data provided');
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        isActive: data.status === 'active',
        accountLocked: data.status === 'blocked',
        // Only update role if provided and valid
        ...(data.role ? { role: data.role } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        accountLocked: true,
        phone: true
      }
    });
    
    // Format status
    const status = updatedUser.accountLocked ? 'blocked' : 
                  updatedUser.isActive ? 'active' : 'inactive';
    
    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        status
      }
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    
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
        message: 'Failed to update user',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 