import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackInitials?: string;
  fallbackBgColor?: string;
  fallbackTextColor?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  width = 40,
  height = 40,
  className = "",
  fallbackInitials,
  fallbackBgColor = "bg-gray-100",
  fallbackTextColor = "text-gray-700"
}: OptimizedImageProps) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !src) {
    return (
      <div className={`${fallbackBgColor} flex items-center justify-center ${className}`}>
        <span className={`${fallbackTextColor} font-medium text-sm`}>
          {fallbackInitials || alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
      priority={false}
    />
  );
}; 