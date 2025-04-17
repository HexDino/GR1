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

export const DepartmentSection = () => {
  const departments = [
    {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Specialized care for heart and cardiovascular conditions',
      icon: '/icons/cardiology.png'
    },
    {
      id: 'neurology',
      name: 'Neurology',
      description: 'Expert treatment for neurological disorders',
      icon: '/icons/neurology.png'
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      description: 'Comprehensive healthcare for children and adolescents',
      icon: '/icons/pediatrics.png'
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      description: 'Treatment for bone, joint, and muscle conditions',
      icon: '/icons/cardiology.png'  // Using existing image as placeholder
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      description: 'Expert care for skin, hair, and nail conditions',
      icon: '/icons/dermatology.png'
    },
    {
      id: 'gastroenterology',
      name: 'Gastroenterology',
      description: 'Specialized care for digestive system disorders',
      icon: '/icons/neurology.png'  // Using existing image as placeholder
    },
    {
      id: 'ophthalmology',
      name: 'Ophthalmology',
      description: 'Comprehensive eye care and vision treatments',
      icon: '/icons/ophthalmology.png'
    },
    {
      id: 'gynecology',
      name: 'Gynecology',
      description: "Specialized women's healthcare services",
      icon: '/icons/gynecology.png'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Departments</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our hospital features specialized departments staffed by experienced healthcare professionals,
            providing comprehensive medical care across various disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <Link 
              href={`/departments/${dept.id}`} 
              key={dept.id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 relative">
                  <Image
                    src={dept.icon}
                    alt={dept.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{dept.name}</h3>
                <p className="text-gray-600 text-sm">{dept.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}; 