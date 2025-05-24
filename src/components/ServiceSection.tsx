"use client";

import React from 'react';
import Link from 'next/link';

const services = [
  {
    id: 1,
    title: "General Medicine",
    description: "Comprehensive primary care for all ages",
    icon: "🩺",
    link: "/services/general-medicine"
  },
  {
    id: 2,
    title: "Emergency Care",
    description: "24/7 emergency medical services",
    icon: "🚑",
    link: "/services/emergency"
  },
  {
    id: 3,
    title: "Cardiology",
    description: "Heart and cardiovascular care",
    icon: "❤️",
    link: "/services/cardiology"
  },
  {
    id: 4,
    title: "Pediatrics",
    description: "Specialized care for children",
    icon: "👶",
    link: "/services/pediatrics"
  }
];

export function ServiceSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive healthcare services with state-of-the-art facilities and experienced medical professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <Link
              key={service.id}
              href={service.link}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600">
                {service.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            View All Services
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
} 