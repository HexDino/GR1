"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  HeartIcon, 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  StarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface PatientStats {
  upcomingAppointments: number;
  totalAppointments: number;
  totalPrescriptions: number;
  activePrescriptions: number;
  totalDoctors: number;
  averageDoctorRating: number;
}

interface UpcomingAppointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  date: string;
  time: string;
  status: string;
  type: string;
  symptoms?: string;
}

interface RecentPrescription {
  id: string;
  doctorName: string;
  mainMedication: string;
  medicationsCount: number;
  createdAt: string;
  expiryDate: string;
  status: string;
}

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  unit: string;
  createdAt: string;
}

export default function PatientDashboard() {
  const { user, isLoading: userLoading } = usePermissions();

  // Fetch patient stats
  const { data: statsResponse, error: statsError, isLoading: statsLoading } = useSWR<{success: boolean} & PatientStats>(
    '/api/patient/stats',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
      dedupingInterval: 60000 // Dedupe for 1 minute
    }
  );
  
  const statsData = statsResponse;

  // Fetch upcoming appointments
  const { data: appointmentsData, error: appointmentsError, isLoading: appointmentsLoading } = useSWR<{appointments: UpcomingAppointment[]}>(
    '/api/patient/appointments?status=upcoming&limit=3',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000, // Refresh every minute for appointments
      dedupingInterval: 30000
    }
  );

  // Fetch recent prescriptions
  const { data: prescriptionsData, error: prescriptionsError, isLoading: prescriptionsLoading } = useSWR<{prescriptions: RecentPrescription[]}>(
    '/api/patient/prescriptions?limit=3',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000,
      dedupingInterval: 60000
    }
  );

  // Fetch recent health metrics
  const { data: healthMetricsData, error: healthMetricsError, isLoading: healthMetricsLoading } = useSWR<{metrics: HealthMetric[]}>(
    '/api/patient/health-metrics?limit=4',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000,
      dedupingInterval: 60000
    }
  );

  if (userLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const stats = statsData || {
    upcomingAppointments: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    activePrescriptions: 0,
    totalDoctors: 0,
    averageDoctorRating: 0
  };

  const appointments = appointmentsData?.appointments || [];
  const prescriptions = prescriptionsData?.prescriptions || [];
  const healthMetrics = healthMetricsData?.metrics || [];

  // Format date and time
  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateDisplay;
    if (date.toDateString() === today.toDateString()) {
      dateDisplay = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateDisplay = 'Tomorrow';
    } else {
      dateDisplay = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }

    return timeString ? `${dateDisplay} at ${timeString}` : dateDisplay;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', label: 'Expired' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Format health metric type
  const formatMetricType = (type: string) => {
    const typeMap = {
      'BLOOD_PRESSURE': 'Blood Pressure',
      'HEART_RATE': 'Heart Rate',
      'WEIGHT': 'Weight',
      'BLOOD_SUGAR': 'Blood Sugar',
      'TEMPERATURE': 'Temperature',
      'CHOLESTEROL': 'Cholesterol'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  // Get metric icon and color
  const getMetricIcon = (type: string) => {
    const iconMap = {
      'BLOOD_PRESSURE': { icon: HeartIcon, color: 'text-red-500 bg-red-50' },
      'HEART_RATE': { icon: HeartIcon, color: 'text-pink-500 bg-pink-50' },
      'WEIGHT': { icon: ChartBarIcon, color: 'text-blue-500 bg-blue-50' },
      'BLOOD_SUGAR': { icon: DocumentTextIcon, color: 'text-green-500 bg-green-50' },
      'TEMPERATURE': { icon: DocumentTextIcon, color: 'text-orange-500 bg-orange-50' },
      'CHOLESTEROL': { icon: ChartBarIcon, color: 'text-purple-500 bg-purple-50' }
    };
    return iconMap[type as keyof typeof iconMap] || { icon: ChartBarIcon, color: 'text-gray-500 bg-gray-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Health Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Here&apos;s your complete health overview.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/doctors"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Book Appointment
          </Link>
          <Link
            href="/dashboard/patient/profile"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-md">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <span className="text-sm text-blue-600 font-medium">Upcoming</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.upcomingAppointments}</h3>
          <p className="text-sm text-gray-600">Appointments</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-md">
              <ClipboardDocumentListIcon className="h-6 w-6" />
            </div>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activePrescriptions}</h3>
          <p className="text-sm text-gray-600">Prescriptions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-md">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <span className="text-sm text-purple-600 font-medium">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalDoctors}</h3>
          <p className="text-sm text-gray-600">Doctors Visited</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white shadow-md">
              <StarIcon className="h-6 w-6" />
            </div>
            <span className="text-sm text-yellow-600 font-medium">Average</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.averageDoctorRating > 0 ? stats.averageDoctorRating.toFixed(1) : 'N/A'}
          </h3>
          <p className="text-sm text-gray-600">Doctor Rating</p>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Health Metrics</h2>
          <Link
            href="/dashboard/patient/health-dashboard"
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            View Detailed Charts
          </Link>
        </div>

        {healthMetricsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : healthMetricsError ? (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500">Error loading health metrics. Please try again later.</p>
          </div>
        ) : healthMetrics.length === 0 ? (
          <div className="text-center py-8">
            <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No health metrics recorded yet</p>
            <Link
              href="/dashboard/patient/health-dashboard"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Record Your First Metric
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map((metric) => {
              const { icon: Icon, color } = getMetricIcon(metric.type);
              return (
                <div key={metric.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(metric.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{formatMetricType(metric.type)}</h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {metric.value} {metric.unit}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
              <Link
                href="/dashboard/patient/appointments"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                View All
              </Link>
            </div>

            {appointmentsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : appointmentsError ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500">Error loading appointments. Please try again later.</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Link
                  href="/doctors"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Book Your First Appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          {appointment.doctorAvatar ? (
                            <img 
                              src={appointment.doctorAvatar} 
                              alt={appointment.doctorName} 
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            appointment.doctorName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Dr. {appointment.doctorName}</p>
                          <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <ClockIcon className="h-4 w-4 inline mr-1" />
                            {formatDateTime(appointment.date, appointment.time)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(appointment.status)}
                        <p className="text-xs text-gray-500 mt-1">{appointment.type}</p>
                      </div>
                    </div>
                    {appointment.symptoms && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Recent Prescriptions</h2>
              <Link
                href="/dashboard/patient/prescriptions"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                View All
              </Link>
            </div>

            {prescriptionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : prescriptionsError ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Error loading prescriptions.</p>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No prescriptions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{prescription.mainMedication}</p>
                        <p className="text-sm text-gray-500">Dr. {prescription.doctorName}</p>
                      </div>
                      {getStatusBadge(prescription.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>{prescription.medicationsCount} medication{prescription.medicationsCount !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Issued: {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 