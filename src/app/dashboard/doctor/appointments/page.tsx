"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Appointment {
  id: string;
  time: string;
  patient: {
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
  service: string;
  symptoms: string;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  statusText: string;
  date: string;
  dateText: string;
  notes?: string;
  diagnosis?: string;
  duration: number;
  priority: string;
}

interface AppointmentFilters {
  status: string;
  date: string;
  search: string;
  sortBy: string;
  sortOrder: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Summary {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 20,
    offset: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: 'all',
    date: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'asc'
  });

  useEffect(() => {
    loadAppointments();
  }, [filters, pagination.offset]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        status: filters.status,
        date: filters.date,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      if (filters.search) {
        queryParams.append('patientSearch', filters.search);
      }

      const response = await fetch(`/api/doctor/appointments?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
        setPagination(data.pagination || pagination);
        setSummary(data.summary || summary);
      } else {
        throw new Error('Failed to load appointments');
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * pagination.limit;
    setPagination(prev => ({ ...prev, offset: newOffset, page: newPage }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'MISSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'NORMAL': return 'text-blue-600 bg-blue-50';
      case 'LOW': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Error Loading Data</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadAppointments();
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Manage Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all your appointments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/doctor"
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="MISSED">Missed</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This Week</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="date">Date & Time</option>
                <option value="patient">Patient Name</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Patient</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Enter patient name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white">
            <h2 className="text-xl font-bold">
              Appointment List ({pagination.total} appointments)
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">No appointments match your filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-purple-25 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Patient Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {appointment.patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>

                      {/* Appointment Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patient.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {appointment.statusText}
                          </span>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(appointment.priority)}`}>
                            {appointment.priority === 'HIGH' ? 'High Priority' : 
                             appointment.priority === 'LOW' ? 'Low Priority' : 'Normal'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Date & Time:</span><br />
                            <span className="text-gray-900">{appointment.dateText} • {appointment.time}</span>
                          </div>
                          <div>
                            <span className="font-medium">Service:</span><br />
                            <span className="text-gray-900">{appointment.service}</span>
                          </div>
                          <div>
                            <span className="font-medium">Symptoms:</span><br />
                            <span className="text-gray-900">{appointment.symptoms}</span>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span><br />
                            <span className="text-gray-900">{appointment.duration} minutes</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-blue-800">Notes: </span>
                            <span className="text-sm text-blue-700">{appointment.notes}</span>
                          </div>
                        )}

                        {appointment.diagnosis && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-green-800">Diagnosis: </span>
                            <span className="text-sm text-green-700">{appointment.diagnosis}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                        View Details
                      </button>
                      {appointment.status === 'PENDING' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Confirm
                        </button>
                      )}
                      {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} 
                  {' '}of {pagination.total} appointments
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      const start = Math.max(1, pagination.page - 2);
                      pageNum = start + i;
                    }
                    
                    if (pageNum <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm border rounded-md ${
                            pageNum === pagination.page
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 