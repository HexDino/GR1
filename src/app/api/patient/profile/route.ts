import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    // Fetch user profile with patient details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        patient: true
      }
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Format the response
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      dateOfBirth: user.profile?.dateOfBirth || user.patient?.dateOfBirth,
      gender: user.profile?.gender || user.patient?.gender,
      address: user.profile?.address,
      bloodType: user.patient?.bloodType,
      allergies: user.patient?.allergies,
      medicalHistory: user.profile?.medicalHistory,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      profile
    });
    
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    
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
        message: 'Failed to fetch profile',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access this resource');
    }

    const body = await req.json();
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodType,
      allergies,
      medicalHistory
    } = body;

    // Validate required fields
    if (!name) {
      throw ApiError.badRequest('Name is required');
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone
      }
    });

    // Update or create profile information
    await prisma.profile.upsert({
      where: { userId },
      update: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        address,
        medicalHistory
      },
      create: {
        userId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        medicalHistory
      }
    });

    // Update or create patient-specific information
    await prisma.patient.upsert({
      where: { userId },
      update: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bloodType,
        allergies
      },
      create: {
        userId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        bloodType,
        allergies
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    });
    
  } catch (error) {
    console.error('Error updating patient profile:', error);
    
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
        message: 'Failed to update profile',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 