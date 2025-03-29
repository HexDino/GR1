import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/doctors - Get all doctors with filtering options
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filtering parameters
    const specialty = searchParams.get('specialty');
    const isAvailable = searchParams.get('isAvailable') === 'true';
    const name = searchParams.get('name');
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Build query filters
    const where = {};
    
    if (specialty) {
      where.specialty = specialty;
    }
    
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }
    
    if (name) {
      where.user = {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      };
    }
    
    // Get doctors with related data
    const doctors = await prisma.doctor.findMany({
      where,
      skip,
      take,
      orderBy: {
        [orderBy]: order,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
    
    // Calculate average rating for each doctor
    const enhancedDoctors = doctors.map(doctor => {
      const reviews = doctor.reviews || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      
      return {
        id: doctor.id,
        name: doctor.user.name,
        email: doctor.user.email,
        specialty: doctor.specialty,
        imageUrl: doctor.imageUrl || doctor.user.image,
        galleryImages: doctor.galleryImages,
        bio: doctor.bio,
        education: doctor.education,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        isAvailable: doctor.isAvailable,
        availableDays: doctor.availableDays,
        availableHours: doctor.availableHours,
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: totalReviews,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      };
    });
    
    // Count total doctors for pagination
    const totalDoctors = await prisma.doctor.count({ where });
    
    return NextResponse.json({
      doctors: enhancedDoctors,
      pagination: {
        total: totalDoctors,
        currentPage: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(totalDoctors / take),
        skip,
        take,
      },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

// POST /api/doctors - Create a new doctor (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const {
      userId,
      specialty,
      bio,
      education,
      experience,
      consultationFee,
      availableDays,
      availableHours,
      licenseNumber,
    } = data;
    
    // Validate required fields
    if (!userId || !specialty) {
      return NextResponse.json(
        { error: 'User ID and specialty are required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is already a doctor
    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId },
    });
    
    if (existingDoctor) {
      return NextResponse.json(
        { error: 'User is already registered as a doctor' },
        { status: 400 }
      );
    }
    
    // Create new doctor
    const doctor = await prisma.doctor.create({
      data: {
        userId,
        specialty,
        bio,
        education,
        experience: experience ? parseInt(experience) : null,
        consultationFee: consultationFee ? parseFloat(consultationFee) : null,
        availableDays,
        availableHours,
        licenseNumber,
        verificationStatus: 'PENDING',
      },
    });
    
    // Update user role to DOCTOR
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'DOCTOR' },
    });
    
    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
} 