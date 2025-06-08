"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DepartmentImageCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const DepartmentImageCard: React.FC<DepartmentImageCardProps> = ({
  id,
  name,
  description,
  imageUrl
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href={`/departments/${id}`}
      className="block overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div 
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div 
          className={`relative w-full transition-all duration-500 ease-in-out ${
            isHovered ? 'h-72 sm:h-80' : 'h-40 sm:h-48'
          }`}
        >
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-cover transition-all duration-500 ease-in-out ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            priority
          />
          {/* Semi-transparent overlay on hover */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        
        {/* Text Content - moves down when image expands */}
        <div 
          className={`p-5 transition-all duration-500 ease-in-out ${
            isHovered ? 'transform translate-y-0' : ''
          }`}
        >
          <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
            isHovered ? 'text-purple-800' : 'text-gray-900'
          }`}>
            {name}
          </h3>
          <p className="text-gray-600 text-sm">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default DepartmentImageCard; 