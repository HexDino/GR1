"use client";

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { AdminOnly, DoctorOnly, PatientOnly } from '@/components/PermissionGate';

// Dashboard stats card component
const StatCard = ({ title, value, icon, color }: { 
  title: string; 
  value: string | number; 
  icon: string;
  color: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, isLoading } = usePermissions();
  const [stats, setStats] = useState({
    appointments: 0,
    messages: 0,
    notifications: 0,
    prescriptions: 0,
    patients: 0,
    reviews: 0,
    users: 0,
    departments: 0,
    doctors: 0,
  });

  useEffect(() => {
    // In a real application, fetch actual stats from an API
    // This is just mock data for demonstration
    const mockStats = {
      appointments: Math.floor(Math.random() * 20),
      messages: Math.floor(Math.random() * 15),
      notifications: Math.floor(Math.random() * 10),
      prescriptions: Math.floor(Math.random() * 8),
      patients: Math.floor(Math.random() * 50),
      reviews: Math.floor(Math.random() * 25),
      users: Math.floor(Math.random() * 100),
      departments: Math.floor(Math.random() * 15),
      doctors: Math.floor(Math.random() * 30),
    };
    
    setStats(mockStats);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
        <p className="text-gray-600">Here&apos;s what&apos;s happening in your dashboard</p>
      </div>

      {/* Role-specific dashboard content */}
      <PatientOnly>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              title="Upcoming Appointments" 
              value={stats.appointments} 
              icon="📅" 
              color="bg-purple-600"
            />
            <StatCard 
              title="New Messages" 
              value={stats.messages} 
              icon="✉️" 
              color="bg-blue-500"
            />
            <StatCard 
              title="Notifications" 
              value={stats.notifications} 
              icon="🔔" 
              color="bg-yellow-500"
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
            {stats.appointments > 0 ? (
              <div className="space-y-4">
                {Array.from({ length: Math.min(3, stats.appointments) }).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">Dr. {['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}</p>
                      <p className="text-sm text-gray-500">
                        {['Cardiology', 'Neurology', 'Dermatology', 'Orthopedics'][Math.floor(Math.random() * 4)]} • 
                        {` ${new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200">
                        Reschedule
                      </button>
                      <button className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-600 hover:bg-red-200">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming appointments.</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Recent Prescriptions</h2>
            {stats.prescriptions > 0 ? (
              <div className="space-y-4">
                {Array.from({ length: Math.min(3, stats.prescriptions) }).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        {['Amoxicillin', 'Lisinopril', 'Metformin', 'Atorvastatin'][Math.floor(Math.random() * 4)]}
                      </p>
                      <span className="text-sm text-gray-500">
                        {new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {['Take with food', 'Take before sleep', 'Take after meals', 'Take with water'][Math.floor(Math.random() * 4)]}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent prescriptions.</p>
            )}
          </div>
        </div>
      </PatientOnly>

      <DoctorOnly>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              title="Today's Appointments" 
              value={stats.appointments} 
              icon="📅" 
              color="bg-purple-600"
            />
            <StatCard 
              title="Total Patients" 
              value={stats.patients} 
              icon="👥" 
              color="bg-blue-500"
            />
            <StatCard 
              title="Reviews" 
              value={stats.reviews} 
              icon="⭐" 
              color="bg-yellow-500"
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Today&apos;s Schedule</h2>
            {stats.appointments > 0 ? (
              <div className="space-y-4">
                {Array.from({ length: Math.min(5, stats.appointments) }).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
                        {['AB', 'CD', 'EF', 'GH', 'IJ'][Math.floor(Math.random() * 5)]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {['John Doe', 'Jane Smith', 'Robert Johnson', 'Mary Williams', 'James Brown'][Math.floor(Math.random() * 5)]}
                        </p>
                        <p className="text-sm text-gray-500">
                          {`${8 + Math.floor(i * 1.5)}:${['00', '30'][Math.floor(Math.random() * 2)]} ${i < 3 ? 'AM' : 'PM'}`} • 
                          {' Check-up'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-600 hover:bg-green-200">
                        Start
                      </button>
                      <button className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No appointments scheduled for today.</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Recent Patient Activity</h2>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {['John Doe', 'Jane Smith', 'Robert Johnson', 'Mary Williams', 'James Brown'][Math.floor(Math.random() * 5)]}
                    </p>
                    <span className="text-sm text-gray-500">
                      {new Date(Date.now() - Math.random() * 7 * 86400000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {[
                      'Updated medical records', 
                      'Requested prescription refill', 
                      'Scheduled a follow-up appointment', 
                      'Submitted pre-visit questionnaire'
                    ][Math.floor(Math.random() * 4)]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DoctorOnly>

      <AdminOnly>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Users" 
              value={stats.users} 
              icon="👥" 
              color="bg-purple-600"
            />
            <StatCard 
              title="Doctors" 
              value={stats.doctors} 
              icon="👨‍⚕️" 
              color="bg-blue-500"
            />
            <StatCard 
              title="Patients" 
              value={stats.patients} 
              icon="🏥" 
              color="bg-green-500"
            />
            <StatCard 
              title="Departments" 
              value={stats.departments} 
              icon="🏢" 
              color="bg-yellow-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Recent User Registrations</h2>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
                        {['AB', 'CD', 'EF', 'GH', 'IJ'][Math.floor(Math.random() * 5)]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {['John Doe', 'Jane Smith', 'Robert Johnson', 'Mary Williams', 'James Brown'][Math.floor(Math.random() * 5)]}
                        </p>
                        <p className="text-sm text-gray-500">
                          {['Patient', 'Doctor', 'Patient', 'Patient', 'Doctor'][i]} • 
                          {' ' + new Date(Date.now() - i * 86400000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <button className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Department Activity</h2>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        {['Cardiology', 'Neurology', 'Dermatology', 'Orthopedics', 'Pediatrics'][i]}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ['bg-green-100 text-green-600', 'bg-yellow-100 text-yellow-600', 'bg-red-100 text-red-600'][Math.floor(Math.random() * 3)]
                      }`}>
                        {['Active', 'Busy', 'Full'][Math.floor(Math.random() * 3)]}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-gray-500">
                        {Math.floor(Math.random() * 20)} appointments today
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.floor(Math.random() * 8)} doctors available
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">System Notifications</h2>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`p-4 border rounded-lg ${
                  ['border-yellow-200 bg-yellow-50', 'border-blue-200 bg-blue-50', 'border-green-200 bg-green-50'][i]
                }`}>
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      ['bg-yellow-200 text-yellow-600', 'bg-blue-200 text-blue-600', 'bg-green-200 text-green-600'][i]
                    }`}>
                      {['⚠️', 'ℹ️', '✅'][i]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {[
                          'System maintenance scheduled', 
                          'New features available', 
                          'Database backup completed'
                        ][i]}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {[
                          'Scheduled for tomorrow at 2:00 AM. Expected downtime: 30 minutes.',
                          'Check out the new appointment scheduling system in the doctor portal.',
                          'Daily backup completed successfully at 1:00 AM.'
                        ][i]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminOnly>
    </div>
  );
} 