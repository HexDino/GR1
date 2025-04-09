"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Service card component
const ServiceCard = ({ 
  title,
  description,
  icon,
  link,
  highlighted = false
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  link: string;
  highlighted?: boolean;
}) => {
  return (
    <Link 
      href={link}
      className={`block group rounded-xl p-8 transition-all duration-300 hover:shadow-lg 
        ${highlighted 
          ? 'bg-purple-600 text-white' 
          : 'bg-white text-gray-800 hover:border-purple-600 border border-gray-200'
        }`}
    >
      <div className={`flex flex-col items-center text-center`}>
        <div className={`mb-5 ${highlighted ? 'text-white' : 'text-purple-600'}`}>
          {icon}
        </div>
        <h3 className={`text-xl font-medium mb-3 ${highlighted ? 'text-white' : 'text-gray-800 group-hover:text-purple-600'}`}>
          {title}
        </h3>
        {description && (
          <p className={`text-sm ${highlighted ? 'text-purple-100' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
    </Link>
  );
};

export const ServiceSection = () => {
  const specialties = [
    {
      title: "Cardiology",
      description: "Specialized care for heart and cardiovascular system disorders",
      icon: (
        <div className="w-16 h-16">
          <Image src="/icons/cardiology.png" alt="Cardiology Icon" width={64} height={64} />
        </div>
      ),
      link: "/services/cardiology"
    },
    {
      title: "Neurology",
      description: "Diagnosis and treatment of nervous system disorders",
      icon: (
        <div className="w-16 h-16">
          <Image src="/icons/neurology.png" alt="Neurology Icon" width={64} height={64} />
        </div>
      ),
      link: "/services/neurology"
    },
    {
      title: "Pediatrics",
      description: "Medical care for infants, children, and adolescents",
      icon: (
        <div className="w-16 h-16">
          <Image src="/icons/pediatrics.png" alt="Pediatrics Icon" width={64} height={64} />
        </div>
      ),
      link: "/services/pediatrics"
    },
    {
      title: "Orthopedics",
      description: "Treatment of musculoskeletal system conditions",
      icon: (
        <div className="w-16 h-16">
          <Image src="/icons/pulmonology.png" alt="Orthopedics Icon" width={64} height={64} />
        </div>
      ),
      link: "/services/orthopedics"
    },
    {
      title: "Dermatology",
      description: "Diagnosis and treatment of skin, hair, and nail conditions",
      icon: (
        <div className="w-16 h-16">
          <Image src="/icons/dermatology.png" alt="Dermatology Icon" width={64} height={64} />
        </div>
      ),
      link: "/services/dermatology"
    },
    {
      title: "Gastroenterology",
      description: "Care for digestive system and gastrointestinal diseases",
      icon: (
        <div className="w-16 h-16">
          <Image src="/icons/stomach.png" alt="Gastroenterology Icon" width={64} height={64} />
        </div>
      ),
      link: "/services/gastroenterology"
    },
    {
      title: "Ophthalmology",
      description: "Medical and surgical eye care services",
      icon: (
        <div className="w-16 h-16">
          <Image src="/icons/ophthalmology.png" alt="Ophthalmology Icon" width={64} height={64} />
        </div>
      ),
      link: "/services/ophthalmology"
    },
    {
      title: "Gynecology",
      description: "Women's reproductive health and pregnancy care",
      icon: (
        <div className="w-16 h-16">
          <Image src="/icons/gynecology.png" alt="Gynecology Icon" width={64} height={64} />
        </div>
      ),
      link: "/services/gynecology"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Medical Specialties</h2>
          <p className="text-gray-600">
            Expert care across multiple specialties<br />
            to address all your health needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {specialties.map((specialty, index) => (
            <ServiceCard 
              key={index}
              title={specialty.title}
              description={specialty.description}
              icon={specialty.icon}
              link={specialty.link}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/services" 
            className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700"
          >
            View all specialties
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}; 