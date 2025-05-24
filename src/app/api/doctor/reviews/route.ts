import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

// GET /api/doctor/reviews - Get reviews for the authenticated doctor
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'DOCTOR') {
      throw ApiError.forbidden('Only doctors can access their reviews');
    }
    
    // Find the doctor
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true }
    });
    
    if (!doctor) {
      throw ApiError.notFound('Doctor profile not found');
    }
    
    const doctorId = doctor.id;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    // Build query based on filter
    let whereClause: any = { doctorId };
    
    if (filter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      whereClause.createdAt = { gte: thirtyDaysAgo };
    } else if (filter === 'positive') {
      whereClause.rating = { gte: 4 };
    } else if (filter === 'negative') {
      whereClause.rating = { lte: 2 };
    }
    
    // Fetch reviews from database
    const reviews = await prisma.doctorReview.findMany({
      where: whereClause,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
          }
        },
        likedBy: {
          select: {
            userId: true,
          }
        }
      }
    });
    
    // Get aggregated stats
    const aggregatedStats = await prisma.doctorReview.groupBy({
      by: ['rating'],
      where: { doctorId },
      _count: {
        rating: true,
      }
    });
    
    // Format ratings count
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    
    aggregatedStats.forEach(stat => {
      if (stat.rating >= 1 && stat.rating <= 5) {
        ratingCounts[stat.rating as keyof typeof ratingCounts] = stat._count.rating;
      }
    });
    
    // Calculate average rating
    const averageRatingResult = await prisma.doctorReview.aggregate({
      where: { doctorId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      }
    });
    
    const averageRating = averageRatingResult._avg.rating || 0;
    const totalReviews = averageRatingResult._count.rating || 0;
    
    // Format response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      isPinned: review.isPinned,
      createdAt: review.createdAt.toISOString(),
      patientId: review.userId,
      patientName: review.user.name,
      patientAvatar: review.user.avatar,
      appointmentId: review.appointmentId,
      appointmentDate: review.appointment?.date 
        ? review.appointment.date.toISOString() 
        : null,
      likesCount: review.likedBy.length
    }));
    
    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      stats: {
        averageRating,
        totalReviews,
        ratingCounts
      }
    });
    
  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    
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
        message: 'Failed to fetch reviews',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/doctor/reviews - Update a review (pin/unpin)
export async function PATCH(request: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'DOCTOR') {
      throw ApiError.forbidden('Only doctors can update their reviews');
    }
    
    // Find the doctor
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true }
    });
    
    if (!doctor) {
      throw ApiError.notFound('Doctor profile not found');
    }
    
    const doctorId = doctor.id;
    const data = await request.json();
    const reviewId = data.reviewId;
    const isPinned = data.isPinned;
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    // Check if review belongs to this doctor
    const review = await prisma.doctorReview.findFirst({
      where: {
        id: reviewId,
        doctorId,
      }
    });
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found or does not belong to you' },
        { status: 404 }
      );
    }
    
    // Update review (pin/unpin)
    const updatedReview = await prisma.doctorReview.update({
      where: { id: reviewId },
      data: { isPinned }
    });
    
    return NextResponse.json({
      success: true,
      review: updatedReview
    });
    
  } catch (error) {
    console.error('Error updating doctor review:', error);
    
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
        message: 'Failed to update review',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 