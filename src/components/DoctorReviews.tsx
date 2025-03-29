'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar, FaThumbsUp, FaUserCircle } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import DoctorReviewForm from './DoctorReviewForm';

interface Review {
  id: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  isPinned: boolean;
  images: string[];
  createdAt: string;
  likes: number;
  user: {
    id: string | null;
    name: string;
    image: string | null;
  };
}

interface DoctorReviewsProps {
  doctorId: string;
  reviewStats?: {
    average: number;
    total: number;
    distribution: {
      [key: number]: number;
    };
  };
}

export default function DoctorReviews({ doctorId, reviewStats }: DoctorReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviews?doctorId=${doctorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReviews();
  }, [doctorId]);
  
  const handleReviewSuccess = () => {
    setShowWriteReview(false);
    fetchReviews();
  };
  
  const handleLikeReview = async (reviewId: string) => {
    if (!session) return;
    
    try {
      // For simplicity, we'll just fetch reviews again after liking
      // In a real app, you would implement an API endpoint for liking reviews
      console.log('Like review:', reviewId);
      
      // Example implementation:
      // await fetch(`/api/reviews/${reviewId}/like`, {
      //   method: 'POST',
      // });
      
      // fetchReviews();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const renderReviewImages = (review: Review) => {
    if (!review.images || review.images.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {review.images.map((image, index) => (
          <div
            key={index}
            className="w-16 h-16 cursor-pointer rounded-md overflow-hidden border border-gray-200 hover:border-[#6C27FF] transition-all duration-300"
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image}
              alt={`Review image ${index + 1}`}
              width={64}
              height={64}
              className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="mt-8">
      {/* Review Stats */}
      {reviewStats && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-gray-800">{reviewStats.average.toFixed(1)}</div>
              <div className="flex mt-2 justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star} 
                    className={`${
                      star <= Math.round(reviewStats.average) 
                        ? 'text-[#6C27FF]' 
                        : 'text-gray-300'
                    } text-xl mx-0.5`} 
                  />
                ))}
              </div>
              <div className="text-gray-600 mt-1">{reviewStats.total} reviews</div>
            </div>
            
            <div className="flex-1 w-full">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewStats.distribution[rating] || 0;
                const percentage = reviewStats.total > 0 
                  ? Math.round((count / reviewStats.total) * 100) 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center mb-1">
                    <div className="flex items-center w-12">
                      <span className="text-sm text-gray-700">{rating}</span>
                      <FaStar className="text-[#6C27FF] ml-1 text-sm" />
                    </div>
                    <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#6C27FF]" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-600 text-right">{percentage}%</div>
                  </div>
                );
              })}
            </div>
            
            <div>
              <button
                onClick={() => setShowWriteReview(!showWriteReview)}
                className="bg-[#6C27FF] text-white px-6 py-3 rounded-lg hover:bg-[#5620CC] hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C27FF]/30"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Write Review Form */}
      {showWriteReview && (
        <div className="mb-8">
          <DoctorReviewForm 
            doctorId={doctorId} 
            onSuccess={handleReviewSuccess} 
          />
        </div>
      )}
      
      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Patient Reviews</h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C27FF]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-600">
            No reviews yet. Be the first to review this doctor!
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${
                  review.isPinned ? 'border-l-4 border-[#6C27FF]' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{review.user.name}</h4>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`${
                                star <= review.rating ? 'text-[#6C27FF]' : 'text-gray-300'
                              } text-sm mr-1`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleLikeReview(review.id)}
                        className="flex items-center text-gray-500 hover:text-[#6C27FF] transition-colors duration-300"
                      >
                        <FaThumbsUp className="mr-1" />
                        <span className="text-xs">{review.likes || 0}</span>
                      </button>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 mt-3">{review.comment}</p>
                    )}
                    
                    {renderReviewImages(review)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full relative">
            <Image
              src={selectedImage}
              alt="Review image"
              width={800}
              height={600}
              className="object-contain max-h-[85vh]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800 hover:text-[#6C27FF]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 