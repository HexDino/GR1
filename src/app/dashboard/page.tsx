"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        console.log('Dashboard: Checking user authentication...');
        
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, redirect to login
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        const userRole = data.user?.role;
        
        console.log('Dashboard: User role:', userRole);
        
        // Redirect based on role
        switch (userRole) {
          case 'DOCTOR':
            router.push('/dashboard/doctor');
            break;
          case 'PATIENT':
            router.push('/dashboard/patient');
            break;
          case 'ADMIN':
            router.push('/dashboard/admin');
            break;
          default:
            throw new Error('Invalid user role');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    // Small delay to ensure proper client-side rendering
    setTimeout(checkUserAndRedirect, 100);
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
        <div className="mt-4 text-sm text-gray-500">
          Checking user permissions
        </div>
      </div>
    </div>
  );
} 