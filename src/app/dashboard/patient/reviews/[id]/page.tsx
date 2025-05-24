"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  StarIcon,
  CalendarIcon,
  UserIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  HandThumbUpIcon
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
  likes?: number;
  isHelpful?: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export default function ReviewDetail() {
  const params = useParams();
  const { user, isLoading: userLoading } = usePermissions();
  const [isDeleting, setIsDeleting] = useState(false);

  const reviewId = params.id as string;

  // Fetch review data
  const { data: reviewData, error: reviewError, isLoading: reviewLoading, mutate } = useSWR<ReviewData>(
    reviewId ? `/api/patient/reviews/${reviewId}` : null,
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0
    }
  );

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
        <p className="text-gray-500 mb-4">The review you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
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

  // Render star rating
  const renderStars = (rating: number, size = 'w-6 h-6') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className={`${size} text-yellow-400`} />
          ) : (
            <StarIcon key={star} className={`${size} text-gray-300`} />
          )
        ))}
        <span className="ml-2 text-lg font-medium text-gray-700">{rating}.0</span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/patient/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/dashboard/patient/reviews';
      } else {
        alert('Failed to delete review. Please try again.');
      }
    } catch (error) {
      alert('Error deleting review. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/patient/reviews"
          className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Reviews
        </Link>

        <div className="flex items-center space-x-3">
          {reviewData.canEdit && (
            <Link
              href={`/dashboard/patient/reviews/${reviewId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-purple-300 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Review
            </Link>
          )}
          
          {reviewData.canDelete && (
            <button
              onClick={handleDeleteReview}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Review
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Review Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Review for Dr. {reviewData.doctorName}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Reviewed on {formatDate(reviewData.createdAt)}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Appointment: {formatDate(reviewData.appointmentDate)}
              </div>
            </div>
          </div>
          {renderStars(reviewData.rating)}
        </div>
      </div>

      {/* Doctor Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h3>
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
            {reviewData.doctorAvatar ? (
              <img 
                src={reviewData.doctorAvatar} 
                alt={reviewData.doctorName} 
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-10 w-10" />
            )}
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900">Dr. {reviewData.doctorName}</h4>
            <p className="text-gray-600 text-lg">{reviewData.doctorSpecialty}</p>
            <div className="flex items-center mt-2">
              <HeartIcon className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-gray-600">Specialist in {reviewData.doctorSpecialty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Review</h3>
        
        {/* Rating Display */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Your Rating</p>
            {renderStars(reviewData.rating, 'w-5 h-5')}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-purple-600">{reviewData.rating}</p>
            <p className="text-sm text-gray-500">out of 5 stars</p>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Review Details</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed text-base">
              {reviewData.reviewText}
            </p>
          </div>
        </div>
      </div>

      {/* Review Stats & Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Activity</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Helpfulness */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <HandThumbUpIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{reviewData.likes || 0}</p>
            <p className="text-sm text-gray-600">People found this helpful</p>
          </div>

          {/* Review Age */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <CalendarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {Math.ceil((new Date().getTime() - new Date(reviewData.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-sm text-gray-600">Days since reviewed</p>
          </div>

          {/* Rating Category */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <StarIconSolid className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">
              {reviewData.rating === 5 && "Excellent"}
              {reviewData.rating === 4 && "Very Good"}
              {reviewData.rating === 3 && "Good"}
              {reviewData.rating === 2 && "Fair"}
              {reviewData.rating === 1 && "Poor"}
            </p>
            <p className="text-sm text-gray-600">Review Rating</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/patient/reviews"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to All Reviews
          </Link>
          
          {reviewData.canEdit && (
            <Link
              href={`/dashboard/patient/reviews/${reviewId}/edit`}
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit This Review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 