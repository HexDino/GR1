"use client";

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
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
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  MapPinIcon,
  FireIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  BeakerIcon,
  EyeIcon,
  PlayIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
  CalendarIcon as CalendarIconSolid
} from '@heroicons/react/24/solid';

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
  diagnosis?: string;
  medications: string[];
  medicationCount: number;
  status: string;
  createdAt: string;
  formattedDate: string;
}

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  unit: string;
  createdAt: string;
  status: 'normal' | 'warning' | 'critical';
}

export default function PatientDashboard() {
  const { user, isLoading: userLoading } = usePermissions();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch patient dashboard data
  const { data: dashboardResponse, error: dashboardError, isLoading: dashboardLoading } = useSWR<{
    success: boolean;
    dashboardStats: PatientStats;
    upcomingAppointments: UpcomingAppointment[];
    recentPrescriptions: RecentPrescription[];
    healthAlerts: any[];
    healthMetrics: any[];
    quickStats: any;
    healthTips: any[];
  }>(
    '/api/patient/dashboard',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000,
      dedupingInterval: 60000
    }
  );

  if (userLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <HeartIconSolid className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your health information...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardResponse?.dashboardStats || {
    upcomingAppointments: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    activePrescriptions: 0,
    totalDoctors: 0,
    averageDoctorRating: 0,
    unreadNotifications: 0,
    newMessages: 0
  };

  const appointments = dashboardResponse?.upcomingAppointments || [];
  const prescriptions = dashboardResponse?.recentPrescriptions || [];
  const healthMetrics = dashboardResponse?.healthMetrics || [];

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
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
    }

    return timeString ? `${dateDisplay} at ${timeString}` : dateDisplay;
  };

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

  const getHealthMetricIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return <HeartIconSolid className="w-5 h-5" />;
      case 'heart_rate':
        return <BeakerIcon className="w-5 h-5" />;
      case 'weight':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'temperature':
        return <FireIcon className="w-5 h-5" />;
      default:
        return <HeartIcon className="w-5 h-5" />;
    }
  };

  const getHealthMetricName = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return 'Blood Pressure';
      case 'heart_rate':
        return 'Heart Rate';
      case 'weight':
        return 'Weight';
      case 'temperature':
        return 'Temperature';
      default:
        return type;
    }
  };

  const getHealthMetricColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Patient Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name || 'Patient'}
              </p>
              <div className="flex items-center text-gray-600 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="font-medium text-sm">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="mx-3 text-gray-400">•</span>
                <span className="font-mono">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-gray-900 font-semibold">{user?.name || 'Patient'}</p>
                <p className="text-gray-500 text-sm">Real-time updates</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <span className="text-lg font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Health Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthMetrics.length > 0 ? (
            healthMetrics.map((metric) => (
              <div key={metric.id} className={`p-6 rounded-2xl border-2 ${getHealthMetricColor(metric.status)} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getHealthMetricColor(metric.status)}`}>
                    {getHealthMetricIcon(metric.type)}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${metric.status === 'normal' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="text-xs font-medium capitalize">{metric.status}</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{getHealthMetricName(metric.type)}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}{metric.unit}
                </p>
                <p className="text-xs text-gray-600">
                  Updated: {new Date(metric.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Health Metrics Available</h3>
              <p className="text-gray-500 mb-4">Start tracking your health by recording your vital signs</p>
              <Link
                href="/dashboard/patient/health-dashboard"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Start Health Tracking
              </Link>
            </div>
          )}
        </div>

        {/* Main Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.upcomingAppointments}</div>
            <div className="text-sm text-gray-600">Upcoming Appointments</div>
            <div className="text-xs text-gray-500 mt-1">Total: {stats.totalAppointments} appointments</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.activePrescriptions}</div>
            <div className="text-sm text-gray-600">Active Prescriptions</div>
            <div className="text-xs text-gray-500 mt-1">Total: {stats.totalPrescriptions} prescriptions</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalDoctors}</div>
            <div className="text-sm text-gray-600">Doctors Visited</div>
            <div className="text-xs text-gray-500 mt-1">
              Avg Rating: {stats.averageDoctorRating > 0 ? stats.averageDoctorRating.toFixed(1) : 'N/A'}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.unreadNotifications || 0}</div>
            <div className="text-sm text-gray-600">New Notifications</div>
            <div className="text-xs text-gray-500 mt-1">{stats.newMessages} new messages</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                <h2 className="text-xl font-bold">
                  Upcoming Appointments ({appointments.length} appointments)
                </h2>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CalendarIconSolid className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
                      <p className="text-gray-600">All scheduled appointments</p>
                    </div>
                  </div>
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <CalendarIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming appointments</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Schedule your first appointment with a specialist doctor to start caring for your health
                    </p>
                    <Link
                      href="/doctors"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Book Appointment
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment, index) => (
                      <div key={appointment.id} className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                                {appointment.doctorAvatar ? (
                                  <img 
                                    src={appointment.doctorAvatar} 
                                    alt={appointment.doctorName} 
                                    className="h-16 w-16 rounded-2xl object-cover"
                                  />
                                ) : (
                                  appointment.doctorName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircleIcon className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg">BS. {appointment.doctorName}</h3>
                              <p className="text-blue-600 font-medium">{appointment.doctorSpecialty}</p>
                              <div className="flex items-center text-gray-600 mt-2">
                                <ClockIcon className="h-4 w-4 mr-2" />
                                <span className="font-medium">{formatDateTime(appointment.date, appointment.time)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            {getStatusBadge(appointment.status)}
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                              {appointment.type}
                            </p>
                          </div>
                        </div>
                        {appointment.symptoms && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-900">
                              <span className="font-semibold">Symptoms:</span> {appointment.symptoms}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Prescriptions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Prescriptions</h3>
                    <p className="text-gray-600 text-sm">Current prescriptions</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/patient/prescriptions"
                  className="text-green-600 hover:text-green-800 font-semibold text-sm bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                >
                  View All
                </Link>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No prescriptions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-green-50/30">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{prescription.doctorName}</h4>
                          <p className="text-sm text-gray-600">{prescription.medications.length > 0 ? prescription.medications[0] : 'Prescription'}</p>
                        </div>
                        {getStatusBadge(prescription.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">{prescription.medicationCount} medication types</p>
                        <p className="text-xs text-gray-500">
                          Prescribed on: {new Date(prescription.createdAt).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Health Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <LightBulbIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Health Tips</h3>
                  <p className="text-gray-600 text-sm">Today</p>
                </div>
              </div>
              
              {dashboardResponse?.healthTips && dashboardResponse.healthTips.length > 0 ? (
                <div className="space-y-3">
                  {dashboardResponse.healthTips.map((tip: any, index: number) => (
                    <div key={index} className="p-3 bg-white rounded-xl border border-purple-100">
                      <p className="text-sm font-medium text-gray-900 mb-1">{tip.title}</p>
                      <p className="text-xs text-gray-600">{tip.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <LightBulbIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No health tips available</p>
                  <p className="text-gray-400 text-xs mt-1">Tips will appear here when available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <PhoneIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Emergency Contact</h3>
                <p className="text-red-100">Contact us immediately for urgent assistance</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:115"
                className="inline-flex items-center px-6 py-3 bg-white text-red-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                Call 115
              </a>
              <a
                href="tel:19008198"
                className="inline-flex items-center px-6 py-3 bg-red-600 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-red-500 transition-all duration-200 transform hover:-translate-y-1"
              >
                <MapPinIcon className="w-5 h-5 mr-2" />
                Nearest Hospital
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 