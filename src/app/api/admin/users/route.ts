import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
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

    // Get query parameters
    const url = new URL(req.url);
    const role = url.searchParams.get('role') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sortField = url.searchParams.get('sort') || 'createdAt';
    const sortDirection = url.searchParams.get('direction') || 'desc';
    const search = url.searchParams.get('search') || '';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build the filter conditions
    const where: any = {};

    // Filter by role
    if (role !== 'all') {
      where.role = role.toUpperCase();
    }

    // Filter by active status
    if (status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      } else if (status === 'pending') {
        where.isEmailVerified = false;
      } else if (status === 'blocked') {
        where.accountLocked = true;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Define sort order
    const orderBy: any = {};
    orderBy[sortField] = sortDirection;

    // Use transaction to get users and count in a single database operation
    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
            select: {
              id: true,
              specialization: true,
              license: true,
              verificationStatus: true
            }
          },
          sessions: {
            orderBy: {
              updatedAt: 'desc'
            },
            take: 1,
            select: {
              updatedAt: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Format user data
    const formattedUsers = users.map(user => {
      const status = user.accountLocked ? 'blocked' : 
                     !user.isEmailVerified ? 'pending' : 
                     user.isActive ? 'active' : 'inactive';
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status,
        createdAt: user.createdAt,
        phone: user.phone,
        lastActive: user.sessions[0]?.updatedAt,
        profileImage: user.avatar
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    
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
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 