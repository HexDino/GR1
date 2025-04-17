"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  comment: string;
  date: string;
}

const TestimonialCard = ({
  name,
  role,
  image,
  rating,
  comment,
  date
}: Testimonial) => {
  return (
    <div className="bg-white rounded-2xl p-8 relative shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Quotation mark decoration */}
      <div className="absolute -top-4 left-8 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Comment content */}
      <div className="flex-grow">
        <div className="pt-4">
          <p className="text-gray-600 italic">{comment}</p>
        </div>
      </div>

      {/* User info and rating - Always at bottom */}
      <div className="pt-4 mt-4 border-t border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
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
              <p className="text-gray-400 text-xs">{date}</p>
            </div>
          </div>

          {/* Rating stars */}
          <div className="flex">
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
        </div>
      </div>
    </div>
  );
};

export const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Cardiologist Patient",
      image: "/testimonials/patient1.png",
      rating: 5,
      comment: "The care I received was exceptional. The doctors were knowledgeable and took the time to explain everything thoroughly. The facilities are modern and clean.",
      date: "March 15, 2024"
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Pediatrics Patient",
      image: "/testimonials/patient2.png",
      rating: 5,
      comment: "The pediatric team was amazing with my child. They made the whole experience comfortable and less scary for both of us. Highly recommended!",
      date: "March 10, 2024"
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "Neurology Patient",
      image: "/testimonials/patient3.png",
      rating: 5,
      comment: "From the reception to the medical staff, everyone was professional and caring. The follow-up care has been outstanding.",
      date: "March 5, 2024"
    }
  ]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    // Uncomment this when API is ready
    // fetchTestimonials();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Patient Testimonials</h2>
          <p className="text-gray-600">
            Hear what our patients have to say about their experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}; 