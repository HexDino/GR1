import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';
import { createReviewSchema } from '@/lib/utils/validation';

// GET /api/patient/reviews - Get patient's reviews
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can access their reviews');
    }
    
    // Fetch patient's reviews from database
    const reviews = await prisma.doctorReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: {
            id: true,
            specialization: true,
            user: {
              select: {
                name: true,
                avatar: true,
              }
            }
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
          }
        }
      }
    });
    
    // Format response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      doctorId: review.doctorId,
      doctorName: review.doctor.user.name,
      doctorSpecialty: review.doctor.specialization,
      doctorAvatar: review.doctor.user.avatar,
      appointmentId: review.appointmentId,
      appointmentDate: review.appointment?.date 
        ? review.appointment.date.toISOString() 
        : null,
      likes: 0, // Placeholder for future feature
      isHelpful: false, // Placeholder for future feature
      canEdit: true,
      canDelete: true
    }));
    
    return NextResponse.json({
      success: true,
      reviews: formattedReviews
    });
    
  } catch (error) {
    console.error('Error fetching patient reviews:', error);
    
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

// POST /api/patient/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    // Get the user ID from the headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }
    
    if (userRole !== 'PATIENT') {
      throw ApiError.forbidden('Only patients can create reviews');
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate review data
    const validationResult = createReviewSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      throw ApiError.badRequest(`Invalid review data: ${errorMessage}`);
    }
    
    const reviewData = validationResult.data;
    
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: reviewData.doctorId },
      select: { id: true }
    });
    
    if (!doctor) {
      throw ApiError.notFound('Doctor not found');
    }
    
    // If appointment ID is provided, check if appointment exists and belongs to patient
    if (reviewData.appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: reviewData.appointmentId,
          patientId: userId,
          doctorId: reviewData.doctorId,
          status: 'COMPLETED'
        }
      });
      
      if (!appointment) {
        throw ApiError.badRequest('Appointment not found or not completed');
      }
      
      // Check if review already exists for this appointment
      const existingReview = await prisma.doctorReview.findFirst({
        where: {
          appointmentId: reviewData.appointmentId,
          userId,
          doctorId: reviewData.doctorId
        }
      });
      
      if (existingReview) {
        throw ApiError.badRequest('Review already exists for this appointment');
      }
    }
    
    // Create the review
    const review = await prisma.doctorReview.create({
      data: {
        userId,
        doctorId: reviewData.doctorId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        appointmentId: reviewData.appointmentId,
        isAnonymous: reviewData.isAnonymous || false,
        isPinned: false
      },
      include: {
        doctor: {
          select: {
            id: true,
            specialization: true,
            user: {
              select: {
                name: true,
                avatar: true,
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        doctorName: review.doctor.user.name,
        doctorSpecialization: review.doctor.specialization
      }
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    
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
        message: 'Failed to create review',
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
} 