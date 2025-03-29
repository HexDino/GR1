'use client';

import { useState, useRef } from 'react';
import { FaStar, FaUpload, FaImage, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DoctorReviewFormProps {
  doctorId: string;
  appointmentId?: string;
  onSuccess?: () => void;
}

export default function DoctorReviewForm({ doctorId, appointmentId, onSuccess }: DoctorReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Validate file types and size
    const validFiles = newFiles.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== newFiles.length) {
      setError('Some files were rejected. Only images under 5MB are allowed.');
    }
    
    // Limit to maximum 3 images
    const filesToAdd = validFiles.slice(0, 3 - selectedImages.length);
    
    if (selectedImages.length + filesToAdd.length > 3) {
      setError('Maximum 3 images allowed.');
    }
    
    // Create preview URLs
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...filesToAdd]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove an image from selection
  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Submit the review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      // Create the review
      const reviewResponse = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          rating,
          comment,
          isAnonymous,
          appointmentId,
        }),
      });
      
      if (!reviewResponse.ok) {
        const errorData = await reviewResponse.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      
      const reviewData = await reviewResponse.json();
      
      // Upload images if any
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach(file => {
          formData.append('files', file);
        });
        formData.append('purpose', 'REVIEW_IMAGE');
        formData.append('entityId', reviewData.id);
        
        const uploadResponse = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload images');
        }
      }
      
      setSuccess('Your review has been submitted successfully!');
      
      // Reset form
      setRating(0);
      setComment('');
      setIsAnonymous(false);
      setSelectedImages([]);
      setPreviewUrls([]);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Refresh the page after a delay
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-700">
          Please <a href="/login" className="text-[#6C27FF] hover:underline">sign in</a> to leave a review.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Write a Review</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Your Rating</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl mr-2 focus:outline-none"
              >
                <FaStar 
                  className={`${
                    star <= (hoverRating || rating) 
                      ? 'text-[#6C27FF]' 
                      : 'text-gray-300'
                  } hover:scale-110 transition-transform duration-300`} 
                />
              </button>
            ))}
            <span className="ml-2 text-gray-600">
              {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-700 mb-2">
            Your Review (optional)
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C27FF]/30 focus:border-[#6C27FF]"
            placeholder="Share your experience with this doctor..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            Add Photos (optional)
          </label>
          <div className="flex flex-wrap gap-4 mb-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                  <Image 
                    src={url} 
                    alt={`Selected image ${index + 1}`} 
                    width={96} 
                    height={96}
                    className="object-cover w-full h-full" 
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
            
            {selectedImages.length < 3 && (
              <button
                type="button"
                onClick={handleUploadClick}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:text-[#6C27FF] hover:border-[#6C27FF] transition-colors duration-300"
              >
                <FaUpload size={20} />
                <span className="mt-2 text-xs">Add Photo</span>
              </button>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/png,image/gif"
              multiple
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500">
            You can upload up to 3 images (JPEG, PNG, GIF) up to 5MB each.
          </p>
        </div>
        
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="anonymous" className="text-gray-700">
            Post as anonymous
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={`w-full py-3 rounded-md ${
            isSubmitting || rating === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#6C27FF] text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6C27FF]/30'
          } transition-all duration-300`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
} 