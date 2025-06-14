import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/utils/apiError';
import { createReviewSchema } from '@/lib/utils/validation';
import { reviewRateLimit } from '@/lib/middleware/rateLimit';

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
        appointment: {
          select: {
            id: true,
            date: true,
            type: true
          }
        }
      }
    });
    
    // Get doctor information for all reviews
    const doctorIds = reviews.map(review => review.doctorId);
    const doctors = await prisma.doctor.findMany({
      where: { id: { in: doctorIds } },
      include: {
        user: true
      }
    });
    
    // Format response
    const formattedReviews = reviews.map(review => {
      const doctor = doctors.find(d => d.id === review.doctorId);
      
      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        images: review.images || [],
        createdAt: review.createdAt.toISOString(),
        doctorId: review.doctorId,
        doctorName: doctor?.user?.name || 'Unknown Doctor',
        doctorSpecialty: doctor?.specialization || 'Specialist',
        doctorAvatar: doctor?.user?.avatar,
        appointmentInfo: review.appointment ? {
          id: review.appointment.id,
          date: review.appointment.date.toISOString(),
          type: review.appointment.type
        } : null,
        likes: 0, // Placeholder for future feature
        isHelpful: false, // Placeholder for future feature
        canEdit: true,
        canDelete: true
      };
    });
    
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
    // Apply rate limiting
    await reviewRateLimit(request);
    
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
    
    // Check if patient already reviewed this doctor
    const existingReview = await prisma.doctorReview.findFirst({
      where: {
        userId,
        doctorId: reviewData.doctorId
      }
    });
    
    if (existingReview) {
      throw ApiError.badRequest('You have already reviewed this doctor. Please edit your existing review instead.');
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
    } else {
      // If no appointment ID is provided, check if the patient has had any completed appointment with this doctor
      const hasCompletedAppointment = await prisma.appointment.findFirst({
        where: {
          patientId: userId,
          doctorId: reviewData.doctorId,
          status: 'COMPLETED'
        }
      });
      
      if (!hasCompletedAppointment) {
        throw ApiError.badRequest('You can only review doctors you have had completed appointments with');
      }
    }
    
    // Create the review
    const review = await prisma.doctorReview.create({
      data: {
        userId,
        doctorId: reviewData.doctorId,
        appointmentId: reviewData.appointmentId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        isAnonymous: reviewData.isAnonymous || false,
        isPinned: false,
        images: reviewData.images || []
      }
    });
    
    // Update doctor's average rating and total reviews count
    const avgRating = await prisma.doctorReview.aggregate({
      where: { doctorId: reviewData.doctorId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    
    await prisma.doctor.update({
      where: { id: reviewData.doctorId },
      data: {
        rating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count.rating
      }
    });
    
    // Get doctor information
    const doctorInfo = await prisma.doctor.findUnique({
      where: { id: review.doctorId },
      include: {
        user: true
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
        doctorName: doctorInfo?.user?.name || 'Unknown Doctor',
        doctorSpecialization: doctorInfo?.specialization || 'Specialist'
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