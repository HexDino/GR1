'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';

interface DoctorProfileProps {
  doctorId: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  imageUrl: string;
  galleryImages: string[];
  bio: string;
  education: string;
  experience: number;
  consultationFee: number;
  isAvailable: boolean;
  availableDays: string[];
  availableHours: string[];
  rating: number;
  reviewCount: number;
}

export default function DoctorProfile({ doctorId }: DoctorProfileProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState('');
  
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/doctors/${doctorId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctor information');
        }
        
        const data = await response.json();
        setDoctor(data);
        
        // Set the profile image as selected image initially
        if (data.imageUrl) {
          setSelectedImage(data.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setError('Could not load doctor information');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C27FF]"></div>
      </div>
    );
  }
  
  if (error || !doctor) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error || 'Doctor not found'}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="md:flex">
        {/* Left column - Doctor Images */}
        <div className="md:w-1/3 p-6 border-r border-gray-200">
          <div className="mb-6">
            {/* Main image display */}
            <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Image 
                src={selectedImage || doctor.imageUrl || "/doctors/placeholder.jpg"} 
                alt={doctor.name}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {/* Profile image thumbnail */}
              <div 
                className={`h-16 w-16 flex-shrink-0 relative rounded-md overflow-hidden cursor-pointer ${selectedImage === doctor.imageUrl ? 'ring-2 ring-[#6C27FF]' : 'opacity-80 hover:opacity-100'}`}
                onClick={() => setSelectedImage(doctor.imageUrl)}
              >
                <Image 
                  src={doctor.imageUrl || "/doctors/placeholder.jpg"} 
                  alt={doctor.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Gallery images thumbnails */}
              {doctor.galleryImages && doctor.galleryImages.map((image, index) => (
                <div 
                  key={index}
                  className={`h-16 w-16 flex-shrink-0 relative rounded-md overflow-hidden cursor-pointer ${selectedImage === image ? 'ring-2 ring-[#6C27FF]' : 'opacity-80 hover:opacity-100'}`}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image 
                    src={image} 
                    alt={`${doctor.name} - image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
            <p className="text-[#6C27FF] text-sm">{doctor.specialty}</p>
            
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={`text-sm ${
                    i < Math.floor(doctor.rating) 
                      ? "text-[#6C27FF]" 
                      : "text-gray-300"
                  }`} 
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">
                {doctor.rating.toFixed(1)} ({doctor.reviewCount} reviews)
              </span>
            </div>
            
            <div className="mt-6">
              <Link 
                href={`/appointment?doctorId=${doctor.id}`}
                className="block w-full py-3 bg-[#6C27FF] text-white text-center rounded-lg hover:bg-[#5620CC] transition-colors duration-300"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right column - Doctor Details */}
        <div className="md:w-2/3 p-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-1 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-[#6C27FF] text-[#6C27FF]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`pb-4 px-1 font-medium text-sm ${
                  activeTab === 'experience'
                    ? 'border-b-2 border-[#6C27FF] text-[#6C27FF]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Experience & Education
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`pb-4 px-1 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-b-2 border-[#6C27FF] text-[#6C27FF]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Schedule
              </button>
            </nav>
          </div>
          
          <div className="py-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">About Doctor</h3>
                <p className="text-gray-600">
                  {doctor.bio || 'No bio information available.'}
                </p>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-500 text-sm">Consultation Fee</p>
                    <p className="text-gray-900 font-medium">${doctor.consultationFee}</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-500 text-sm">Experience</p>
                    <p className="text-gray-900 font-medium">{doctor.experience} years</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'experience' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Experience</h3>
                  <p className="text-gray-600">
                    {doctor.experience ? `${doctor.experience} years of experience in ${doctor.specialty}` : 'No experience information available.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Education</h3>
                  <p className="text-gray-600">
                    {doctor.education || 'No education information available.'}
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Available Schedule</h3>
                
                {doctor.availableDays && doctor.availableDays.length > 0 ? (
                  <div className="space-y-3">
                    {doctor.availableDays.map((day, index) => (
                      <div key={index} className="flex border border-gray-200 rounded-lg p-3">
                        <div className="flex-shrink-0 bg-[#6C27FF]/10 rounded-lg p-3 mr-4">
                          <FaCalendarAlt className="text-[#6C27FF]" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{day}</p>
                          <div className="flex items-center mt-1">
                            <FaClock className="text-gray-400 mr-2 text-sm" />
                            <p className="text-gray-600 text-sm">
                              {doctor.availableHours && doctor.availableHours[index] || 'Hours not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No schedule information available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 