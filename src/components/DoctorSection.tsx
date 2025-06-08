"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AuthModal } from './AuthModal';

// Doctor card component
const DoctorCard = ({ 
  doctor,
  onBookAppointment
}: {
  doctor: {
    id: string;
    name: string;
    specialty: string;
    image: string;
    rating: number;
    reviewCount: number;
    available: boolean;
  },
  onBookAppointment: () => void;
}) => {
  // Function to render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`h-5 w-5 ${i < Math.floor(rating) 
              ? 'text-purple-600 fill-purple-600' 
              : i < rating 
                ? 'text-purple-600 fill-purple-600' 
                : 'text-gray-300 fill-gray-300'}`}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
        <span className="text-gray-500 ml-2 text-sm">({doctor.reviewCount})</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="relative">
        {doctor.available && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-0.5"></span>
              Available
            </span>
          </div>
        )}
        
        <div className="relative h-[180px] w-full mx-auto mb-4 overflow-hidden rounded-xl bg-white">
          <div className="bg-purple-600 absolute h-[90px] w-full top-1/2 -translate-y-1/2 rounded-xl"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <Image 
              src={doctor.image} 
              alt={doctor.name}
              width={160}
              height={160}
              className="object-cover w-[160px] h-[160px]"
            />
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-1">{doctor.name}</h3>
        <p className="text-gray-500 text-sm mb-3">{doctor.specialty}</p>
        
        <div className="mb-4">
          {renderRating(doctor.rating)}
        </div>
        
        <button 
          onClick={onBookAppointment}
          className="border border-purple-600 text-purple-600 rounded-full px-5 py-2 text-sm font-medium transition hover:bg-purple-600 hover:text-white w-full"
        >
          Book an Appointment
        </button>
      </div>
    </div>
  );
};

export const DoctorSection = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const handleBookAppointment = () => {
    setIsAuthModalOpen(true);
  };

  // Mẫu dữ liệu, sau này sẽ được lấy từ cơ sở dữ liệu
  const doctors = [
    {
      id: "dr-robert-henry",
      name: "Dr. Robert Henry",
      specialty: "Cardiologist",
      image: "/doctors/doctor1.jpg",
      rating: 4.5,
      reviewCount: 102,
      available: true
    },
    {
      id: "dr-harry-littleton",
      name: "Dr. Harry Littleton",
      specialty: "Neurologist",
      image: "/doctors/doctor2.jpg",
      rating: 4.5,
      reviewCount: 97,
      available: true
    },
    {
      id: "dr-sharina-khan",
      name: "Dr. Sharina Khan",
      specialty: "Gynologist",
      image: "/doctors/doctor3.jpg",
      rating: 4.5,
      reviewCount: 116,
      available: true
    },
    {
      id: "dr-sanjeev-kapoor",
      name: "Dr. Sanjeev Kapoor",
      specialty: "Child Specialist",
      image: "/doctors/doctor4.jpg",
      rating: 4.5,
      reviewCount: 72,
      available: true
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet our Doctors</h2>
          <p className="text-gray-600">
            Well qualified doctors are ready to serve you
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {doctors.slice(0, 4).map((doctor) => (
            <div key={doctor.id} className="col-span-1 sm:col-span-1">
              <DoctorCard doctor={doctor} onBookAppointment={handleBookAppointment} />
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/doctors" 
            className="inline-block bg-purple-600 text-white rounded-full px-6 py-3 text-sm font-medium transition hover:bg-purple-700"
          >
            See more
          </Link>
        </div>
        
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="signup"
        />
      </div>
    </section>
  );
}; 