import React from 'react';
import { ServiceSection } from '@/components/ServiceSection';

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-indigo-600 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Our Medical Services</h1>
          <p className="text-indigo-200 text-center mt-4 max-w-2xl mx-auto">
            We provide a comprehensive range of healthcare services designed to meet all your medical needs in one place.
          </p>
        </div>
      </div>
      
      <ServiceSection />
      
      {/* This could be expanded with more detailed service information */}
    </div>
  );
} 