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
  EyeIcon
} from '@heroicons/react/24/outline';

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
}

export default function PatientAppointments() {
  const { user, isLoading: userLoading } = usePermissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      refreshInterval: 60000, // Refresh every minute
      dedupingInterval: 30000
    }
  );

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const appointments = appointmentsData?.appointments || [];

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => {
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
      CONFIRMED: { color: 'bg-green-100 text-green-800', label: 'Confirmed', icon: CheckCircleIcon },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: ClockIcon },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircleIcon },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: CheckCircleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-600 mt-1">
            Manage your medical appointments and view appointment history.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
          <Link
            href="/doctors"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Book New Appointment
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor, specialty, symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Appointments</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {appointmentsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : appointmentsError ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Error loading appointments. Please try again later.</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {appointments.length === 0 ? 'No appointments found' : 'No appointments match your search'}
            </p>
            <Link
              href="/doctors"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Doctor Avatar */}
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      {appointment.doctorAvatar ? (
                        <img 
                          src={appointment.doctorAvatar} 
                          alt={appointment.doctorName} 
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6" />
                      )}
                    </div>

                    {/* Appointment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">Dr. {appointment.doctorName}</p>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDateTime(appointment.date, appointment.time)}
                        <span className="mx-2">•</span>
                        <span>{appointment.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/patient/appointments/${appointment.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </div>
                </div>

                {/* Additional Details */}
                {(appointment.symptoms || appointment.diagnosis) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {appointment.symptoms && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Symptoms: </span>
                        <span className="text-sm text-gray-600">{appointment.symptoms}</span>
                      </div>
                    )}
                    {appointment.diagnosis && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Diagnosis: </span>
                        <span className="text-sm text-gray-600">{appointment.diagnosis}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {!appointmentsLoading && !appointmentsError && appointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="text-center text-sm text-gray-600">
            Showing {filteredAppointments.length} of {appointments.length} total appointments
          </div>
        </div>
      )}
    </div>
  );
} 