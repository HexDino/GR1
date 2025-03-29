import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/doctors/[id] - Get a specific doctor
export async function GET(request, { params }) {
  try {
    const id = params.id;
    
    // Get doctor with related data
    const doctor = await prisma.doctor.findUnique({
      where: { id },
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
            images: true,
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
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Calculate average rating
    const reviews = doctor.reviews || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const enhancedDoctor = {
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      specialty: doctor.specialty,
      imageUrl: doctor.imageUrl || doctor.user.image,
      galleryImages: doctor.galleryImages || [],
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
    
    return NextResponse.json(enhancedDoctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor' },
      { status: 500 }
    );
  }
}

// PATCH /api/doctors/[id] - Update a doctor (admin or self only)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const id = params.id;
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check authorization (only the doctor themselves or admin can update)
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    if (doctor.user.id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to update this doctor' },
        { status: 403 }
      );
    }
    
    // Get update data
    const data = await request.json();
    const {
      specialty,
      bio,
      education,
      experience,
      consultationFee,
      availableDays,
      availableHours,
      isAvailable,
    } = data;
    
    // Update doctor
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        specialty,
        bio,
        education,
        experience: experience !== undefined ? parseInt(experience) : undefined,
        consultationFee: consultationFee !== undefined ? parseFloat(consultationFee) : undefined,
        availableDays,
        availableHours,
        isAvailable,
      },
    });
    
    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    );
  }
} 