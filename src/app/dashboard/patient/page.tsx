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
  Cog6ToothIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  SparklesIcon
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
  unreadNotifications: number;
  newMessages: number;
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

interface QuickStat {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export default function PatientDashboard() {
  const { user, isLoading: userLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch patient stats
  const { data: statsResponse, error: statsError, isLoading: statsLoading } = useSWR<{success: boolean} & PatientStats>(
    '/api/patient/stats',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000,
      dedupingInterval: 60000
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
      refreshInterval: 60000,
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
    averageDoctorRating: 0,
    unreadNotifications: 0,
    newMessages: 0
  };

  const appointments = appointmentsData?.appointments || [];
  const prescriptions = prescriptionsData?.prescriptions || [];

  // Quick stats for health metrics
  const quickStats: QuickStat[] = [
    { label: 'Blood Pressure', value: '120/80', change: -2, trend: 'down', color: 'text-green-600' },
    { label: 'Heart Rate', value: '72 BPM', change: 5, trend: 'up', color: 'text-blue-600' },
    { label: 'Weight', value: '70.5 kg', change: -0.5, trend: 'down', color: 'text-purple-600' },
    { label: 'BMI', value: '22.4', change: 0, trend: 'stable', color: 'text-gray-600' },
  ];

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
      CONFIRMED: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Confirmed' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
      COMPLETED: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed' },
      ACTIVE: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active' },
      EXPIRED: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Expired' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-purple-100 text-lg mb-4">
                Here&apos;s your complete health overview for today
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>All systems healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/doctors"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Book Appointment
              </Link>
              <Link
                href="/dashboard/patient/profile"
                className="inline-flex items-center px-6 py-3 bg-purple-600 border-2 border-purple-400 rounded-xl text-sm font-semibold text-white hover:bg-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartIcon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              </div>
              {getTrendIcon(stat.trend)}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className={`text-sm ${stat.change > 0 ? 'text-red-600' : stat.change < 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {stat.change !== 0 && (stat.change > 0 ? '+' : '')}{stat.change !== 0 ? stat.change : 'No change'} from last week
            </p>
          </div>
        ))}
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-2xl shadow-sm p-6 border border-blue-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-14 w-14 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <CalendarIcon className="h-7 w-7" />
              </div>
              <span className="text-sm text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded-full">Upcoming</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.upcomingAppointments}</h3>
            <p className="text-sm text-gray-600">Appointments scheduled</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-2xl shadow-sm p-6 border border-green-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-14 w-14 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <ClipboardDocumentListIcon className="h-7 w-7" />
              </div>
              <span className="text-sm text-green-700 font-semibold bg-green-100 px-3 py-1 rounded-full">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.activePrescriptions}</h3>
            <p className="text-sm text-gray-600">Active prescriptions</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 rounded-2xl shadow-sm p-6 border border-purple-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-14 w-14 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <UserGroupIcon className="h-7 w-7" />
              </div>
              <span className="text-sm text-purple-700 font-semibold bg-purple-100 px-3 py-1 rounded-full">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalDoctors}</h3>
            <p className="text-sm text-gray-600">Doctors consulted</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 rounded-2xl shadow-sm p-6 border border-amber-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-14 w-14 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <StarIcon className="h-7 w-7" />
              </div>
              <span className="text-sm text-amber-700 font-semibold bg-amber-100 px-3 py-1 rounded-full">Average</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {stats.averageDoctorRating > 0 ? stats.averageDoctorRating.toFixed(1) : 'N/A'}
            </h3>
            <p className="text-sm text-gray-600">Doctor rating</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
                <p className="text-gray-600 mt-1">Your scheduled consultations</p>
              </div>
              <Link
                href="/dashboard/patient/appointments"
                className="text-purple-600 hover:text-purple-800 font-semibold text-sm bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100 transition-all duration-200"
              >
                View All
              </Link>
            </div>

            {appointmentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : appointmentsError ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Error loading appointments. Please try again later.</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-500 mb-6">Schedule your next consultation with a doctor</p>
                <Link
                  href="/doctors"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Book Your First Appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {appointments.map((appointment, index) => (
                  <div key={appointment.id} className="p-6 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 hover:border-purple-200 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-bold text-lg shadow-sm">
                            {appointment.doctorAvatar ? (
                              <img 
                                src={appointment.doctorAvatar} 
                                alt={appointment.doctorName} 
                                className="h-16 w-16 rounded-xl object-cover"
                              />
                            ) : (
                              appointment.doctorName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">Dr. {appointment.doctorName}</h3>
                          <p className="text-purple-600 font-medium">{appointment.doctorSpecialty}</p>
                          <div className="flex items-center text-gray-600 mt-2">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            <span className="font-medium">{formatDateTime(appointment.date, appointment.time)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(appointment.status)}
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{appointment.type}</p>
                      </div>
                    </div>
                    {appointment.symptoms && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Reason for visit:</span> {appointment.symptoms}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Prescriptions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Prescriptions</h3>
                <p className="text-gray-600 text-sm mt-1">Your medications</p>
              </div>
              <Link
                href="/dashboard/patient/prescriptions"
                className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
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
                  <div key={prescription.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{prescription.mainMedication}</h4>
                        <p className="text-sm text-gray-600">Dr. {prescription.doctorName}</p>
                      </div>
                      {getStatusBadge(prescription.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">{prescription.medicationsCount} medication{prescription.medicationsCount !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-500">
                        Issued: {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-sm p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <BellIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <p className="text-gray-600 text-sm">Stay updated</p>
                </div>
              </div>
              {stats.unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {stats.unreadNotifications}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Appointment reminder</p>
                  <p className="text-xs text-gray-600">Tomorrow at 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Prescription ready</p>
                  <p className="text-xs text-gray-600">Available for pickup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/doctors"
            className="group p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:border-purple-300 hover:-translate-y-1"
          >
            <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 mb-4 group-hover:scale-110">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Book Appointment</h3>
            <p className="text-gray-600">Schedule a consultation with a doctor</p>
          </Link>

          <Link 
            href="/dashboard/patient/prescriptions"
            className="group p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:border-purple-300 hover:-translate-y-1"
          >
            <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-200 mb-4 group-hover:scale-110">
              <ClipboardDocumentListIcon className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">View Prescriptions</h3>
            <p className="text-gray-600">Check your medication history</p>
          </Link>

          <Link 
            href="/dashboard/patient/health-dashboard"
            className="group p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 hover:border-purple-300 hover:-translate-y-1"
          >
            <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 mb-4 group-hover:scale-110">
              <ChartBarIcon className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Health Dashboard</h3>
            <p className="text-gray-600">Monitor your health metrics</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 