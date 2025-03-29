'use client';

import { useParams } from 'next/navigation';
import DoctorProfile from '@/components/DoctorProfile';
import DoctorReviews from '@/components/DoctorReviews';
import { useState, useEffect } from 'react';

interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    [key: number]: number;
  };
}

export default function DoctorDetailPage() {
  const params = useParams();
  const doctorId = params.id as string;
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const response = await fetch(`/api/reviews?doctorId=${doctorId}&stats=true`);
        
        if (response.ok) {
          const data = await response.json();
          setReviewStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching review stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (doctorId) {
      fetchReviewStats();
    }
  }, [doctorId]);
  
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Doctor Profile Section */}
        <DoctorProfile doctorId={doctorId} />
        
        {/* Reviews Section */}
        <DoctorReviews doctorId={doctorId} reviewStats={reviewStats} />
      </div>
    </main>
  );
} 