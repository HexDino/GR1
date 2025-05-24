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
  MagnifyingGlassIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  ShareIcon,
  ClockIcon,
  CheckCircleIcon,
  Bars3Icon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid
} from '@heroicons/react/24/solid';

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
  tags?: string[];
  appointmentType?: 'checkup' | 'consultation' | 'follow-up' | 'emergency';
  wouldRecommend?: boolean;
}

export default function PatientReviews() {
  const { user, isLoading: userLoading } = usePermissions();
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
      refreshInterval: 300000,
      dedupingInterval: 60000
    }
  );

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

  const reviews = reviewsData?.reviews || [];

  // Use only real data from API
  const displayReviews = reviews;

  // Filter reviews based on search term and rating
  const filteredReviews = displayReviews.filter(review => {
    if (!searchTerm && ratingFilter === 'all') return true;
    
    let matchesSearch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = (
        review.doctorName.toLowerCase().includes(searchLower) ||
        review.doctorSpecialty.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower) ||
        (review.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ?? false)
      );
    }
    
    let matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

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

  // Get statistics
  const stats = {
    total: filteredReviews.length,
    averageRating: filteredReviews.length > 0 ? 
      parseFloat((filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length).toFixed(1)) : 0,
    fiveStars: filteredReviews.filter(r => r.rating === 5).length,
    recommended: filteredReviews.filter(r => (r.wouldRecommend ?? false) === true).length,
    totalLikes: filteredReviews.reduce((sum, review) => sum + (review.likes || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-yellow-600 via-orange-600 to-red-700 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-pattern-dots"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <StarIconSolid className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Doctor Reviews</h1>
                <p className="text-yellow-100 text-lg">
                  Share your healthcare experiences and help others
                </p>
                <div className="flex items-center gap-4 mt-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{stats.total} reviews written</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-sm">{stats.averageRating} average rating</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRefresh}
                className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2 group-hover:animate-spin" />
                Refresh
              </button>
              <Link
                href="/dashboard/patient/reviews/create"
                className="group inline-flex items-center px-8 py-3 bg-white text-orange-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Write Review
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftIconSolid className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p className="text-gray-600 text-sm font-medium">Reviews</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <StarIconSolid className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Avg</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.averageRating}</h3>
            <p className="text-gray-600 text-sm font-medium">Rating</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <StarIconSolid className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">5★</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.fiveStars}</h3>
            <p className="text-gray-600 text-sm font-medium">Five Stars</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Rec</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.recommended}</h3>
            <p className="text-gray-600 text-sm font-medium">Recommended</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <HeartIconSolid className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">Likes</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalLikes}</h3>
            <p className="text-gray-600 text-sm font-medium">Total Likes</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-2">Search Reviews</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor, specialty, or review content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-bold text-gray-900 mb-2">Filter by Rating</label>
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none bg-white"
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

            {/* View Mode Toggle */}
            <div className="lg:w-48">
              <label className="block text-sm font-bold text-gray-900 mb-2">View Mode</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <StarIcon className="w-4 h-4 inline mr-1" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Bars3Icon className="w-4 h-4 inline mr-1" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Doctor Reviews</h2>
                <p className="text-gray-600 text-sm">
                  {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <StarIcon className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : reviewsError ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Error loading reviews</p>
                <button 
                  onClick={handleRefresh}
                  className="text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <StarIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchTerm 
                    ? `No reviews match your search criteria "${searchTerm}"`
                    : 'Start sharing your healthcare experiences by writing your first review.'
                  }
                </p>
                <Link
                  href="/dashboard/patient/reviews/create"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Write Your First Review
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                {filteredReviews.map((review) => (
                  <div key={review.id} className={`group ${
                    viewMode === 'list' 
                      ? 'p-6 border-2 border-gray-100 rounded-2xl hover:border-yellow-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-yellow-50/30'
                      : 'p-6 border-2 border-gray-100 rounded-2xl hover:border-yellow-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-yellow-50/30'
                  }`}>
                    {/* Doctor Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-yellow-700 font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                            {review.doctorAvatar ? (
                              <img 
                                src={review.doctorAvatar} 
                                alt={review.doctorName} 
                                className="h-16 w-16 rounded-2xl object-cover"
                              />
                            ) : (
                              review.doctorName.charAt(0).toUpperCase()
                            )}
                          </div>
                          {(review.wouldRecommend ?? false) && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                              <CheckCircleIcon className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{review.doctorName}</h3>
                          <p className="text-yellow-600 font-medium">{review.doctorSpecialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating, 'w-4 h-4')}
                            <span className="text-sm font-medium text-gray-700">({review.rating}/5)</span>
                          </div>
                        </div>
                      </div>
                      {review.appointmentType && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                          {review.appointmentType}
                        </span>
                      )}
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed line-clamp-4">
                        {review.comment}
                      </p>
                    </div>

                    {/* Tags */}
                    {review.tags && review.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {review.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Review Stats */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500">Appointment:</span>
                          <p className="font-medium text-gray-900">{formatDate(review.appointmentDate)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">Reviewed:</span>
                          <p className="font-medium text-gray-900">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        {review.likes && review.likes > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <HeartIcon className="w-4 h-4 text-red-500" />
                            <span>{review.likes} likes</span>
                          </div>
                        )}
                        {review.isHelpful === true && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <HandThumbUpIcon className="w-4 h-4" />
                            <span>Helpful</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                          View
                        </button>
                        {review.canEdit && (
                          <Link
                            href={`/dashboard/patient/reviews/${review.id}/edit`}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-sm bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                            Edit
                          </Link>
                        )}
                        {review.canDelete && (
                          <button 
                            onClick={() => handleDeleteReview(review.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold text-sm bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  );
} 