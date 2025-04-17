"use client";

import React, { useState } from 'react';
import Image from 'next/image';

// Testimonial card component
const TestimonialCard = ({
  name,
  role,
  image,
  rating,
  comment
}: {
  name: string;
  role: string;
  image: string;
  rating: number;
  comment: string;
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mx-4">
      <div className="flex items-center mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="text-gray-800 font-medium">{name}</h4>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
      
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-purple-600 fill-purple-600' : 'text-gray-300 fill-gray-300'}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
      
      <p className="text-gray-600 text-sm">{comment}</p>
    </div>
  );
};

export const TestimonialSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const testimonials = [
    {
      name: "Sara Ali Khan",
      role: "Cardiologist Patient",
      image: "/testimonials/patient1.jpg",
      rating: 5,
      comment: "Thanks for all the services, no doubt it is the best hospital."
    },
    {
      name: "Simon Targett",
      role: "Neurologist Patient",
      image: "/testimonials/patient2.jpg",
      rating: 5,
      comment: "Thanks for all the services, no doubt it is the best hospital."
    },
    {
      name: "Sara Ali Khan",
      role: "Cardiologist Patient",
      image: "/testimonials/patient3.jpg",
      rating: 5,
      comment: "Thanks for all the services, no doubt it is the best hospital."
    },
    {
      name: "John Smith",
      role: "Pediatrics Patient",
      image: "/testimonials/patient4.jpg",
      rating: 5,
      comment: "Thanks for all the services, no doubt it is the best hospital."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Patients Testimonial</h2>
          <p className="text-gray-600">
            Let's see what our happy patients says
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="flex overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}; 