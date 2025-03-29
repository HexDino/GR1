import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/reviews - Get reviews with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filtering parameters
    const doctorId = searchParams.get('doctorId');
    const userId = searchParams.get('userId');
    const getStats = searchParams.get('stats') === 'true';
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Build query filters
    const where = {};
    
    if (doctorId) {
      where.doctorId = doctorId;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    // Get reviews with related data
    const reviews = await prisma.doctorReview.findMany({
      where,
      skip,
      take,
      orderBy: {
        [orderBy]: order === 'asc' ? 'asc' : 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            likedBy: true,
          },
        },
      },
    });
    
    // Transform reviews to include doctor name
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      isAnonymous: review.isAnonymous,
      isPinned: review.isPinned,
      images: review.images || [],
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      likes: review._count.likedBy,
      user: review.isAnonymous 
        ? { id: null, name: 'Anonymous User', image: null } 
        : review.user,
      doctor: {
        id: review.doctor.id,
        name: review.doctor.user.name,
        specialty: review.doctor.specialty,
      },
    }));
    
    // Count total reviews for pagination
    const totalReviews = await prisma.doctorReview.count({ where });
    
    // Calculate review statistics if requested
    let stats = null;
    if (getStats && doctorId) {
      const allReviews = await prisma.doctorReview.findMany({
        where: { doctorId },
        select: { rating: true },
      });
      
      const total = allReviews.length;
      const average = total > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / total 
        : 0;
      
      // Calculate distribution
      const distribution = {};
      for (let i = 1; i <= 5; i++) {
        distribution[i] = allReviews.filter(review => review.rating === i).length;
      }
      
      stats = {
        average: parseFloat(average.toFixed(1)),
        total,
        distribution,
      };
    }
    
    return NextResponse.json({
      reviews: transformedReviews,
      stats,
      pagination: {
        total: totalReviews,
        currentPage: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(totalReviews / take),
        skip,
        take,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { doctorId, rating, comment, isAnonymous, appointmentId } = data;
    
    // Validate required fields
    if (!doctorId || !rating) {
      return NextResponse.json(
        { error: 'Doctor ID and rating are required' },
        { status: 400 }
      );
    }
    
    // Check if doctor exists
    const doctorExists = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    
    if (!doctorExists) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Check if user has already reviewed this doctor
    const existingReview = await prisma.doctorReview.findFirst({
      where: {
        doctorId,
        userId: session.user.id,
      },
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this doctor' },
        { status: 400 }
      );
    }
    
    // Create review
    const review = await prisma.doctorReview.create({
      data: {
        doctorId,
        userId: session.user.id,
        rating,
        comment: comment || '',
        isAnonymous: isAnonymous || false,
        images: [],
        appointmentId,
      },
    });
    
    // If it's from an appointment, update the appointment
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { reviewed: true },
      });
    }
    
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews - Update a review
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { id, rating, comment, isAnonymous } = data;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    // Check if review exists and belongs to the user
    const review = await prisma.doctorReview.findUnique({
      where: { id },
    });
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the review or is an admin
    if (review.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to update this review' },
        { status: 403 }
      );
    }
    
    // Update review
    const updatedReview = await prisma.doctorReview.update({
      where: { id },
      data: {
        rating: rating !== undefined ? rating : review.rating,
        comment: comment !== undefined ? comment : review.comment,
        isAnonymous: isAnonymous !== undefined ? isAnonymous : review.isAnonymous,
      },
    });
    
    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews?id=123 - Delete a review
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    // Check if review exists
    const review = await prisma.doctorReview.findUnique({
      where: { id },
    });
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the review or is an admin
    if (review.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this review' },
        { status: 403 }
      );
    }
    
    // Delete review likes first
    await prisma.reviewLike.deleteMany({
      where: { reviewId: id },
    });
    
    // Delete review
    await prisma.doctorReview.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
} 