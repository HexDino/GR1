"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  StarIcon, 
  CalendarIcon,
  UserIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface DoctorReview {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  rating: number;
  comment: string;
  appointmentDate: string;
  createdAt: string;
  likes?: number;
  isHelpful?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function PatientReviews() {
  const { user, isLoading: userLoading } = usePermissions();
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (ratingFilter !== 'all') {
      params.append('rating', ratingFilter);
    }
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    params.append('limit', '50');
    return `/api/patient/reviews?${params.toString()}`;
  };

  // Fetch reviews
  const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading, mutate } = useSWR<{reviews: DoctorReview[]}>(
    buildApiUrl(),
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
      dedupingInterval: 60000
    }
  );

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];

  // Render star rating
  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className={`${size} text-yellow-400`} />
          ) : (
            <StarIcon key={star} className={`${size} text-gray-300`} />
          )
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    mutate();
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/patient/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
      } else {
        alert('Failed to delete review. Please try again.');
      }
    } catch (error) {
      alert('Error deleting review. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Doctor Reviews</h1>
          <p className="text-gray-600 mt-1">
            View and manage your reviews of doctors and medical services.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
          <Link
            href="/dashboard/patient/reviews/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Write Review
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {(searchTerm || ratingFilter !== 'all') && (
          <div className="mt-4 text-sm text-gray-600">
            Found {reviews.length} review{reviews.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
            {ratingFilter !== 'all' && ` with ${ratingFilter} star${ratingFilter !== '1' ? 's' : ''}`}
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {reviewsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : reviewsError ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Error loading reviews. Please try again later.</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm || ratingFilter !== 'all' ? 'No reviews match your criteria' : 'You haven&apos;t written any reviews yet'}
            </p>
            <Link
              href="/dashboard/patient/reviews/create"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Write Your First Review
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Doctor Avatar */}
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                      {review.doctorAvatar ? (
                        <img 
                          src={review.doctorAvatar} 
                          alt={review.doctorName} 
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6" />
                      )}
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">Dr. {review.doctorName}</h3>
                          <p className="text-sm text-gray-500">{review.doctorSpecialty}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium text-gray-700">{review.rating}.0</span>
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="mb-3">
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>

                      {/* Review Meta */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Appointment: {formatDate(review.appointmentDate)}
                        </div>
                        <div>
                          Reviewed: {formatDate(review.createdAt)}
                        </div>
                        {review.likes && review.likes > 0 && (
                          <div>
                            {review.likes} found helpful
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/dashboard/patient/reviews/${review.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    
                    {(review.canEdit !== false) && (
                      <Link
                        href={`/dashboard/patient/reviews/${review.id}/edit`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    )}
                    
                    {(review.canDelete !== false) && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {!reviewsLoading && !reviewsError && reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">{reviews.length}</p>
              <p className="text-sm text-gray-500">Total Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
              </p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {reviews.filter(r => r.likes && r.likes > 0).length}
              </p>
              <p className="text-sm text-gray-500">Helpful Reviews</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 