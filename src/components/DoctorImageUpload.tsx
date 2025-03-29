'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';

interface DoctorImageUploadProps {
  doctorId: string;
  currentImage?: string;
  galleryImages?: string[];
  onSuccess?: () => void;
}

export default function DoctorImageUpload({ 
  doctorId, 
  currentImage, 
  galleryImages = [], 
  onSuccess 
}: DoctorImageUploadProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadType, setUploadType] = useState<'profile' | 'gallery'>('profile');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
    
    if (!isValidType) {
      setError('Only image files (JPEG, PNG, GIF) are allowed.');
      return;
    }
    
    if (!isValidSize) {
      setError('Image size should be less than 5MB.');
      return;
    }
    
    // Create preview
    setPreviewImage(URL.createObjectURL(file));
    
    // Upload the file
    await handleUpload(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUpload = async (file: File) => {
    if (!session) {
      setError('You must be logged in to upload images');
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('files', file);
      formData.append('purpose', uploadType === 'profile' ? 'DOCTOR_PROFILE' : 'DOCTOR_GALLERY');
      formData.append('entityId', doctorId);
      
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      setSuccess(uploadType === 'profile' 
        ? 'Profile image uploaded successfully!' 
        : 'Gallery image uploaded successfully!'
      );
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };
  
  const cancelPreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  };
  
  if (!session) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-center text-gray-700">
          Please <a href="/login" className="text-[#6C27FF] hover:underline">sign in</a> to upload images.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload Images</h3>
      
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
      
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          onClick={() => setUploadType('profile')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            uploadType === 'profile'
              ? 'bg-[#6C27FF] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Profile Image
        </button>
        <button
          type="button"
          onClick={() => setUploadType('gallery')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            uploadType === 'gallery'
              ? 'bg-[#6C27FF] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Gallery Images
        </button>
      </div>
      
      {uploadType === 'profile' && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Profile Image</label>
          <div className="flex items-start space-x-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden w-32 h-32 flex-shrink-0">
              {previewImage ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={previewImage} 
                    alt="Profile preview" 
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={cancelPreview}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              ) : currentImage ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={currentImage} 
                    alt="Current profile" 
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <FaImage size={32} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className={`bg-[#6C27FF] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                  isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#5620CC]'
                }`}
              >
                <FaUpload className="mr-2" />
                {isUploading ? 'Uploading...' : 'Upload New Image'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Upload a square image for best results. Max size: 5MB.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {uploadType === 'gallery' && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Gallery Images</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden h-32">
                <Image 
                  src={image} 
                  alt={`Gallery image ${index + 1}`} 
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            
            {previewImage && (
              <div className="relative rounded-lg overflow-hidden h-32">
                <Image 
                  src={previewImage} 
                  alt="New gallery image" 
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={cancelPreview}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 ${
                isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:border-[#6C27FF] hover:text-[#6C27FF]'
              }`}
            >
              <FaUpload size={24} className="mb-2" />
              <span className="text-sm">
                {isUploading ? 'Uploading...' : 'Add Gallery Image'}
              </span>
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Add up to 10 images showcasing your clinic or practice. Max size: 5MB each.
          </p>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
      />
    </div>
  );
} 