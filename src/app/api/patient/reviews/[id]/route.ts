import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';

// GET /api/patient/reviews/[id] - Get specific review
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access their reviews');
    }

    const { id: reviewId } = await params;

    // Fetch review with doctor information
    const review = await prisma.doctorReview.findFirst({
      where: {
        id: reviewId,
        userId: userId
      }
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }
    
    // Fetch doctor information separately
    const doctor = await prisma.doctor.findUnique({
      where: { id: review.doctorId },
      include: {
        user: true
      }
    });

    // Format the response
    const formattedReview = {
      id: review.id,
      rating: review.rating,
      reviewText: review.comment,
      doctorName: doctor?.user?.name || 'Unknown Doctor',
      doctorSpecialty: doctor?.specialization || 'Specialist',
      doctorAvatar: doctor?.user?.avatar,
      createdAt: review.createdAt.toISOString(),
      likes: 0, // Placeholder for future feature
      isHelpful: false, // Placeholder for future feature
      canEdit: true,
      canDelete: true
    };

    return NextResponse.json(formattedReview);
    
  } catch (error) {
    console.error('Error fetching review details:', error);
    
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
        message: 'Failed to fetch review details',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT /api/patient/reviews/[id] - Update review
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can edit their reviews');
    }

    const { id: reviewId } = await params;
    const { rating, comment, images } = await req.json();

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      throw ApiError.badRequest('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim().length === 0) {
      throw ApiError.badRequest('Comment is required');
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.doctorReview.findFirst({
      where: {
        id: reviewId,
        userId: userId
      }
    });

    if (!existingReview) {
      throw ApiError.notFound('Review not found');
    }

    // Update the review
    const updatedReview = await prisma.doctorReview.update({
      where: { id: reviewId },
      data: {
        rating: parseInt(rating),
        comment: comment.trim(),
        images: images || existingReview.images // Keep existing images if not provided
      }
    });
    
    // Update doctor's average rating
    const doctorId = existingReview.doctorId;
    const avgRating = await prisma.doctorReview.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        rating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count.rating
      }
    });
    
    // Get doctor information
    const doctor = await prisma.doctor.findUnique({
      where: { id: updatedReview.doctorId },
      include: {
        user: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        images: updatedReview.images,
        doctorName: doctor?.user?.name || 'Unknown Doctor',
        updatedAt: updatedReview.updatedAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    
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

// DELETE /api/patient/reviews/[id] - Delete review
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can delete their reviews');
    }

    const { id: reviewId } = await params;

    // Check if review exists and belongs to user
    const existingReview = await prisma.doctorReview.findFirst({
      where: {
        id: reviewId,
        userId: userId
      }
    });

    if (!existingReview) {
      throw ApiError.notFound('Review not found');
    }
    
    // Store doctorId before deleting the review
    const doctorId = existingReview.doctorId;

    // Delete the review
    await prisma.doctorReview.delete({
      where: { id: reviewId }
    });
    
    // Update doctor's average rating
    const avgRating = await prisma.doctorReview.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        rating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count.rating
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    
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
        message: 'Failed to delete review',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 