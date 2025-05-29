"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  PhoneIcon,
  VideoCameraIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { 
  CalendarIcon as CalendarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  date: string;
  time: string;
  status: string;
  type: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  location?: string;
  appointmentType?: 'in-person' | 'video' | 'phone';
}

export default function PatientAppointments() {
  const { user, isLoading: userLoading } = usePermissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    params.append('limit', '50');
    return `/api/patient/appointments?${params.toString()}`;
  };

  // Fetch appointments
  const { data: appointmentsData, error: appointmentsError, isLoading: appointmentsLoading, mutate } = useSWR<{appointments: Appointment[]}>(
    buildApiUrl(),
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000,
      dedupingInterval: 30000
    }
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <CalendarIconSolid className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  const appointments = appointmentsData?.appointments || [];

  // Use only real data from API
  const displayAppointments = appointments;

  // Filter appointments based on search term
  const filteredAppointments = displayAppointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.doctorName.toLowerCase().includes(searchLower) ||
      appointment.doctorSpecialty.toLowerCase().includes(searchLower) ||
      appointment.symptoms?.toLowerCase().includes(searchLower) ||
      appointment.diagnosis?.toLowerCase().includes(searchLower)
    );
  });

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
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }

    return timeString ? `${dateDisplay} at ${timeString}` : dateDisplay;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Confirmed', icon: CheckCircleIconSolid },
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', icon: ClockIconSolid },
      CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', icon: XCircleIconSolid },
      COMPLETED: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed', icon: CheckCircleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Get appointment type icon
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="w-4 h-4 text-blue-600" />;
      case 'phone':
        return <PhoneIcon className="w-4 h-4 text-green-600" />;
      default:
        return <MapPinIcon className="w-4 h-4 text-purple-600" />;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    mutate();
  };

  // Get upcoming appointments count
  const upcomingCount = filteredAppointments.filter(apt => {
    const appointmentDate = new Date(apt.date);
    return appointmentDate >= new Date() && apt.status !== 'CANCELLED';
  }).length;

  // Get statistics
  const stats = {
    total: filteredAppointments.length,
    upcoming: filteredAppointments.filter(apt => apt.status === 'CONFIRMED' || apt.status === 'PENDING').length,
    completed: filteredAppointments.filter(apt => apt.status === 'COMPLETED').length,
    cancelled: filteredAppointments.filter(apt => apt.status === 'CANCELLED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                My Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage your appointments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
              <Link
                href="/doctors"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Book New
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Appointments</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-2">Search Appointments</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor, specialty, symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <label className="block text-sm font-bold text-gray-900 mb-2">Filter by Status</label>
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="all">All Appointments</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:w-48">
              <label className="block text-sm font-bold text-gray-900 mb-2">View Mode</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Bars3Icon className="w-4 h-4 inline mr-1" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List/Grid */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white">
            <h2 className="text-xl font-bold">
              Your Appointments ({filteredAppointments.length} appointments)
            </h2>
          </div>
          <div className="p-8">
            {appointmentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <CalendarIcon className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : appointmentsError ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Error loading appointments</p>
                <button 
                  onClick={handleRefresh}
                  className="text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchTerm 
                    ? `No appointments match your search criteria "${searchTerm}"`
                    : 'You haven\'t booked any appointments yet. Schedule your first appointment with a specialist doctor.'
                  }
                </p>
                <Link
                  href="/doctors"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Book Your First Appointment
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredAppointments.map((appointment, index) => (
                  <div key={appointment.id} className={`group ${
                    viewMode === 'list' 
                      ? 'p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30'
                      : 'p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/30'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
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
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-gray-100">
                            {getAppointmentTypeIcon(appointment.appointmentType || 'in-person')}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{appointment.doctorName}</h3>
                          <p className="text-blue-600 font-medium">{appointment.doctorSpecialty}</p>
                          <div className="flex items-center text-gray-600 mt-2">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            <span className="font-medium">{formatDateTime(appointment.date, appointment.time)}</span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center text-gray-600 mt-1">
                              <MapPinIcon className="h-4 w-4 mr-2" />
                              <span className="text-sm">{appointment.location}</span>
                            </div>
                          )}
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
                      <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Symptoms:</span> {appointment.symptoms}
                        </p>
                      </div>
                    )}

                    {appointment.diagnosis && (
                      <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-sm text-green-900">
                          <span className="font-semibold">Diagnosis:</span> {appointment.diagnosis}
                        </p>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-sm text-yellow-900">
                          <span className="font-semibold">Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Booked: {new Date(appointment.createdAt).toLocaleDateString('en-US')}</span>
                        {appointment.appointmentType && (
                          <span className="capitalize flex items-center gap-1">
                            {getAppointmentTypeIcon(appointment.appointmentType)}
                            {appointment.appointmentType.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === 'CONFIRMED' && (
                          <button className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-sm bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            Join
                          </button>
                        )}
                        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                          Details
                        </button>
                      </div>
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