"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  StarIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface ReviewData {
  id: string;
  rating: number;
  reviewText: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  appointmentDate: string;
  createdAt: string;
  canEdit: boolean;
  canDelete: boolean;
}

export default function EditReview() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: userLoading } = usePermissions();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const reviewId = params.id as string;

  // Fetch review data
  const { data: reviewData, error: reviewError, isLoading: reviewLoading } = useSWR<ReviewData>(
    reviewId ? `/api/patient/reviews/${reviewId}` : null,
    fetcher
  );

  // Set initial form data when review loads
  useEffect(() => {
    if (reviewData) {
      setRating(reviewData.rating);
      setComment(reviewData.reviewText);
    }
  }, [reviewData]);

  if (userLoading || reviewLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (reviewError || !reviewData) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Not Found</h2>
        <p className="text-gray-500 mb-4">The review you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.</p>
        <Link
          href="/dashboard/patient/reviews"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Reviews
        </Link>
      </div>
    );
  }

  if (!reviewData.canEdit) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cannot Edit Review</h2>
        <p className="text-gray-500 mb-4">You don&apos;t have permission to edit this review.</p>
        <Link
          href="/dashboard/patient/reviews"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Reviews
        </Link>
      </div>
    );
  }

  // Render star rating selector
  const renderStarSelector = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {star <= rating ? (
              <StarIconSolid className="w-8 h-8 text-yellow-400" />
            ) : (
              <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating === 1 && "Poor"}
          {rating === 2 && "Fair"}
          {rating === 3 && "Good"}
          {rating === 4 && "Very Good"}
          {rating === 5 && "Excellent"}
        </span>
      </div>
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      setSubmitError('Please select a rating between 1 and 5 stars.');
      return;
    }
    
    if (!comment.trim()) {
      setSubmitError('Please write a review comment.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`/api/patient/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/dashboard/patient/reviews');
      } else {
        setSubmitError(data.message || 'Failed to update review. Please try again.');
      }
    } catch (error) {
      setSubmitError('An error occurred while updating the review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/patient/reviews"
          className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Reviews
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Edit Review</h1>
        <p className="text-gray-600 mt-1">
          Update your review for Dr. {reviewData.doctorName}
        </p>
      </div>

      {/* Doctor Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
            {reviewData.doctorAvatar ? (
              <img 
                src={reviewData.doctorAvatar} 
                alt={reviewData.doctorName} 
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold">{reviewData.doctorName.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Dr. {reviewData.doctorName}</h3>
            <p className="text-gray-600">{reviewData.doctorSpecialty}</p>
            <p className="text-sm text-gray-500">
              Appointment: {formatDate(reviewData.appointmentDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            {renderStarSelector()}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Review Comment *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Share your experience with this doctor..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating Review...
                </>
              ) : (
                'Update Review'
              )}
            </button>
            <Link
              href="/dashboard/patient/reviews"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Review History */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Review History</h4>
        <p className="text-sm text-gray-600">
          Originally reviewed on {formatDate(reviewData.createdAt)}
        </p>
      </div>
    </div>
  );
} 