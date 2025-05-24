"use client";

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Stats {
  appointments: number;
  patients: number;
  prescriptions: number;
  rating: number;
}

interface AppData {
  user: User | null;
  stats: Stats | null;
  loading: boolean;
  error: string | null;
}

export default function IsolatedDoctorPage() {
  const [data, setData] = useState<AppData>({
    user: null,
    stats: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    console.log('Isolated doctor page mounted');
    
    const loadData = async () => {
      try {
        // Simple API call without any complex dependencies
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const userData = await response.json();
          setData({
            user: userData.user,
            stats: {
              appointments: 8,
              patients: 156,
              prescriptions: 89,
              rating: 4.7
            },
            loading: false,
            error: null
          });
        } else {
          throw new Error('Authentication failed');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setData(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        }));
      }
    };

    // Small delay to ensure client-side rendering
    setTimeout(loadData, 100);
  }, []);

  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <h2 className="text-red-800 text-xl font-semibold mb-4">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{data.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              MedCare - Doctor Dashboard
            </h1>
            <div className="text-sm text-gray-500">
              Welcome, Dr. {data.user?.name || 'Doctor'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-green-800 font-semibold mb-2">✅ Dashboard Loaded Successfully!</h2>
          <p className="text-green-600">
            This isolated doctor page loaded without errors. User: {data.user?.role}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
                📅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats?.appointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">
                👥
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Patients</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats?.patients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl">
                📋
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats?.prescriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 text-xl">
                ⭐
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats?.rating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left border border-blue-200">
              <div className="text-blue-600 text-2xl mb-2">📅</div>
              <h4 className="font-medium text-blue-800">New Appointment</h4>
              <p className="text-sm text-blue-600">Schedule new patient visit</p>
            </button>
            
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left border border-green-200">
              <div className="text-green-600 text-2xl mb-2">📋</div>
              <h4 className="font-medium text-green-800">Write Prescription</h4>
              <p className="text-sm text-green-600">Create new prescription</p>
            </button>
            
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left border border-purple-200">
              <div className="text-purple-600 text-2xl mb-2">👥</div>
              <h4 className="font-medium text-purple-800">View Patients</h4>
              <p className="text-sm text-purple-600">Manage patient records</p>
            </button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">User Data:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✅ Name: {data.user?.name || 'N/A'}</li>
                <li>✅ Email: {data.user?.email || 'N/A'}</li>
                <li>✅ Role: {data.user?.role || 'N/A'}</li>
                <li>✅ ID: {data.user?.id || 'N/A'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">System Status:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✅ Page mounted successfully</li>
                <li>✅ API call completed</li>
                <li>✅ No client-side errors</li>
                <li>✅ Timestamp: {new Date().toLocaleString()}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 