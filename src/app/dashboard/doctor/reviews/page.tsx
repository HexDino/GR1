"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, ChartBarIcon, FunnelIcon, ClockIcon, HeartIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces for review data
interface Review {
  id: string;
  rating: number;
  comment: string;
  patientName: string;
  patientAvatar?: string;
  createdAt: string;
  appointmentId?: string;
  appointmentDate?: string;
  isPinned: boolean;
  likesCount: number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  stats: ReviewStats;
}

// Star Rating Component
const StarRating = ({ rating, showNumber = false }: { rating: number; showNumber?: boolean }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <StarIconSolid className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarIconOutline className="h-5 w-5 text-gray-300" />
          )}
        </span>
      ))}
      {showNumber && <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, subtitle, icon, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <StarIconOutline className="h-12 w-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      You haven&apos;t received any reviews from patients yet. Keep providing excellent care and reviews will start coming in!
    </p>
    <Link 
      href="/dashboard/doctor/appointments"
      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      <ClockIcon className="h-4 w-4 mr-2" />
      View Appointments
    </Link>
  </div>
);

export default function DoctorReviews() {
  const { user, isLoading: userLoading } = usePermissions();
  const [filter, setFilter] = useState<'all' | 'recent' | 'positive' | 'negative'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch reviews from API based on filter
  const { data, error, isLoading, mutate } = useSWR<ReviewsResponse>(
    `/api/doctor/reviews${filter !== 'all' ? `?filter=${filter}` : ''}`,
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
      dedupingInterval: 60000 // Dedupe for 1 minute
    }
  );
  
  // Toggle pin status
  const togglePinReview = async (reviewId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/doctor/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          isPinned: !currentStatus,
        }),
      });
      
      if (response.ok) {
        // Revalidate data after successful update
        mutate();
      } else {
        console.error('Failed to update review pin status');
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  // Export reviews data
  const exportReviews = () => {
    const reviews = data?.reviews || [];
    const stats = data?.stats || {};
    
    const csvContent = [
      ['Patient Name', 'Rating', 'Comment', 'Date', 'Appointment Date'].join(','),
      ...reviews.map(review => [
        review.patientName,
        review.rating,
        `"${review.comment?.replace(/"/g, '""') || 'No comment'}"`,
        new Date(review.createdAt).toLocaleDateString(),
        review.appointmentDate ? new Date(review.appointmentDate).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `doctor-reviews-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return formatDate(dateString);
  };
  
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <StarIconSolid className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your reviews...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error occurred</h3>
            <p className="text-sm text-red-700 mt-1">Unable to load reviews. Please try again later.</p>
            <button 
              onClick={() => mutate()}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const reviews = data?.reviews || [];
  const stats = data?.stats || { 
    averageRating: 0, 
    totalReviews: 0, 
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
  };
  
  // Filter reviews based on search term
  const filteredReviews = reviews.filter(review => 
    review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    false
  );
  
  // Calculate percentage for each rating
  const getRatingPercentage = (count: number) => {
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-b-3xl mx-4 mb-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-pattern-dots"></div>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <StarIconSolid className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Patient Reviews</h1>
                <p className="text-purple-100 text-lg">
                  Your patient feedback and ratings
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={exportReviews}
                className="group inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Export Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats.totalReviews > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Average Rating"
              value={stats.averageRating.toFixed(1)}
              subtitle={`${stats.totalReviews} reviews`}
              icon={<StarIconSolid className="h-6 w-6" />}
              color="bg-yellow-500"
            />
            <StatsCard
              title="Positive Reviews"
              value={stats.ratingCounts[5] + stats.ratingCounts[4]}
              subtitle={`${getRatingPercentage(stats.ratingCounts[5] + stats.ratingCounts[4]).toFixed(1)}%`}
              icon={<HeartIcon className="h-6 w-6" />}
              color="bg-green-500"
            />
            <StatsCard
              title="Total Reviews"
              value={stats.totalReviews}
              subtitle="From patients"
              icon={<ChartBarIcon className="h-6 w-6" />}
              color="bg-purple-500"
            />
          </div>

          {/* Quick Insights */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
            <h3 className="text-lg font-semibold mb-3 text-purple-800">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalReviews > 0 ? ((stats.ratingCounts[5] + stats.ratingCounts[4]) / stats.totalReviews * 100).toFixed(0) : 0}%
                </div>
                <div className="text-gray-600">Patient Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reviews.filter(r => r.isPinned).length}
                </div>
                <div className="text-gray-600">Pinned Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reviews.filter(r => new Date(r.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-gray-600">Reviews This Month</div>
              </div>
            </div>
          </div>

          {/* Detailed Rating Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
              Detailed Analysis
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
                  <div>
                    <StarRating rating={Math.round(stats.averageRating)} />
                    <p className="text-sm text-gray-500">{stats.totalReviews} reviews</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="w-8 text-sm text-gray-700 font-medium">{rating} star</span>
                    <div className="flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${getRatingPercentage(stats.ratingCounts[rating as keyof typeof stats.ratingCounts])}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {stats.ratingCounts[rating as keyof typeof stats.ratingCounts]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 mt-2 mr-2" />
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              onClick={() => setFilter('all')}
            >
              All ({stats.totalReviews})
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'recent' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              onClick={() => setFilter('recent')}
            >
              Recent
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'positive' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              onClick={() => setFilter('positive')}
            >
              Positive ({stats.ratingCounts[5] + stats.ratingCounts[4]})
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'negative' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              onClick={() => setFilter('negative')}
            >
              Needs Improvement ({stats.ratingCounts[2] + stats.ratingCounts[1]})
            </button>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-500 mr-2" />
                <p className="text-sm text-blue-700">
                  {filteredReviews.length === 0 
                    ? `No reviews found for "${searchTerm}"`
                    : `Found ${filteredReviews.length} review${filteredReviews.length !== 1 ? 's' : ''} for "${searchTerm}"`
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-auto text-blue-500 hover:text-blue-700 text-sm underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">
                  {searchTerm 
                    ? `No reviews found matching "${searchTerm}". Try a different search term.`
                    : "No reviews found for the selected filter."
                  }
                </p>
              </div>
            ) : (
              filteredReviews.map(review => (
                <div 
                  key={review.id} 
                  className={`bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md ${
                    review.isPinned ? 'border-l-4 border-purple-500 bg-purple-50' : 'border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold mr-4">
                        {review.patientAvatar ? (
                          <img 
                            src={review.patientAvatar} 
                            alt={review.patientName} 
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          review.patientName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {getRelativeTime(review.createdAt)}
                          {review.appointmentDate && ` • Appointment on ${formatDate(review.appointmentDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <StarRating rating={review.rating} showNumber />
                      {review.isPinned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment || (
                        <span className="italic text-gray-500">No comment provided by patient.</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex gap-3">
                      <button 
                        className={`text-sm flex items-center transition-colors ${
                          review.isPinned 
                            ? 'text-purple-600 hover:text-purple-800' 
                            : 'text-gray-500 hover:text-purple-600'
                        }`}
                        onClick={() => togglePinReview(review.id, review.isPinned)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 mr-1" 
                          fill={review.isPinned ? "currentColor" : "none"}
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {review.isPinned ? 'Unpin' : 'Pin to Profile'}
                      </button>
                      
                      <button 
                        className="text-sm flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                        onClick={() => {
                          // You can implement a modal or inline response feature here
                          alert('Response feature - to be implemented with a modal or inline text area');
                        }}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 mr-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Respond
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {review.likesCount > 0 && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <HeartIcon className="h-4 w-4 text-red-500 mr-1" />
                          {review.likesCount} like{review.likesCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      
                      {review.appointmentId && (
                        <Link 
                          href={`/dashboard/doctor/appointments/${review.appointmentId}`}
                          className="text-sm text-purple-600 hover:text-purple-800 flex items-center transition-colors"
                        >
                          View Appointment
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
} 