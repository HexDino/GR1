"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PrinterIcon, XMarkIcon, EyeIcon, CalendarIcon, ClockIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: 'All',
    date: 'All',
    search: '',
    sortBy: 'date',
    sortOrder: 'asc'
  });
  
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 10,
    offset: 0,
    page: 1,
    totalPages: 0,
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

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          time: '01:46',
          patient: {
            name: 'Ngo Van Minh',
            email: 'ngo.minh@example.com',
            phone: '+84123456789'
          },
          service: 'VIRTUAL',
          symptoms: 'Abdominal pain',
          status: 'PENDING',
          statusText: 'Pending',
          date: '2025-03-12',
          dateText: '12/3/2025',
          duration: 30,
          priority: 'HIGH',
          notes: 'Patient has been experiencing severe abdominal pain for 2 days.'
        },
        {
          id: '2',
          time: '04:59',
          patient: {
            name: 'Tran Thi Binh',
            email: 'tran.binh@example.com',
            phone: '+84987654321'
          },
          service: 'IN_PERSON',
          symptoms: 'Back pain',
          status: 'CONFIRMED',
          statusText: 'Confirmed',
          date: '2025-03-13',
          dateText: '31/3/2025',
          duration: 30,
          priority: 'NORMAL',
          notes: 'Patient responded well to treatment. Follow-up recommended in 2 weeks.',
          diagnosis: 'Acid reflux'
        },
        {
          id: '3',
          time: '09:06',
          patient: {
            name: 'Le Van Cuong',
            email: 'le.cuong@example.com',
            phone: '+84555666777'
          },
          service: 'IN_PERSON',
          symptoms: 'Weight loss concerns',
          status: 'COMPLETED',
          statusText: 'Completed',
          date: '2025-04-13',
          dateText: '13/4/2025',
          duration: 30,
          priority: 'NORMAL',
          diagnosis: 'Nutritional deficiency - recommended dietary changes'
        },
        {
          id: '4',
          time: '14:30',
          patient: {
            name: 'Pham Thi Lan',
            email: 'pham.lan@example.com',
            phone: '+84333444555'
          },
          service: 'VIRTUAL',
          symptoms: 'Headache and dizziness',
          status: 'CANCELLED',
          statusText: 'Cancelled',
          date: '2025-03-15',
          dateText: '15/3/2025',
          duration: 45,
          priority: 'HIGH',
          notes: 'Patient cancelled due to emergency. Needs to reschedule.'
        },
        {
          id: '5',
          time: '16:15',
          patient: {
            name: 'Nguyen Van Duc',
            email: 'nguyen.duc@example.com',
            phone: '+84777888999'
          },
          service: 'IN_PERSON',
          symptoms: 'Chest pain',
          status: 'MISSED',
          statusText: 'Missed',
          date: '2025-03-10',
          dateText: '10/3/2025',
          duration: 60,
          priority: 'HIGH',
          notes: 'Patient did not show up for appointment. Follow-up required.'
        }
      ];

      setAppointments(mockAppointments);
      setPagination({
        total: mockAppointments.length,
        limit: 10,
        offset: 0,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
      
      setSummary({
        total: mockAppointments.length,
        pending: mockAppointments.filter(a => a.status === 'PENDING').length,
        confirmed: mockAppointments.filter(a => a.status === 'CONFIRMED').length,
        completed: mockAppointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: mockAppointments.filter(a => a.status === 'CANCELLED').length
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [filters, pagination.page]);

  const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handlePrint = () => {
    window.print();
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
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-title { 
            display: block !important;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
          }
          body { background: white !important; }
          .bg-gray-50 { background: white !important; }
          .shadow-md, .shadow-sm { box-shadow: none !important; }
          .border-gray-100 { border-color: #ccc !important; }
        }
      `}</style>

      {/* Print Header - Hidden on screen */}
      <div className="print-title hidden">
        <h1>Appointment Management Report</h1>
        <p>Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 no-print">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Appointments</h1>
            <p className="text-gray-600 mt-1">View and manage all your appointments</p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{summary.confirmed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{summary.completed}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{summary.cancelled}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 no-print">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="All">All</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="MISSED">Missed</option>
              </select>
            </div>

            {/* Time Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="All">All</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
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
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">
              Appointment List ({pagination.total} appointments)
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
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
                <div key={appointment.id} className="p-6 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Patient Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
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
                    <div className="flex flex-col space-y-2 no-print">
                      <button 
                        onClick={() => handleViewDetails(appointment)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 no-print">
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

      {/* Appointment Details Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                <p className="text-gray-600">Detailed information about the appointment</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Appointment Info */}
                <div className="space-y-6">
                  {/* Patient Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Patient Information
                    </h3>
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {selectedAppointment.patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xl font-semibold text-gray-900">{selectedAppointment.patient.name}</h4>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                          {selectedAppointment.statusText}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-gray-900">{selectedAppointment.patient.email}</p>
                        </div>
                      </div>
                      
                      {selectedAppointment.patient.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Phone</p>
                            <p className="text-gray-900">{selectedAppointment.patient.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Appointment Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date & Time</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedAppointment.dateText}</p>
                        <p className="text-purple-600 font-medium">{selectedAppointment.time}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Service Type</p>
                        <p className="text-gray-900">{selectedAppointment.service}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Duration</p>
                        <p className="text-gray-900">{selectedAppointment.duration} minutes</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Priority</p>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(selectedAppointment.priority)}`}>
                          {selectedAppointment.priority === 'HIGH' ? 'High Priority' : 
                           selectedAppointment.priority === 'LOW' ? 'Low Priority' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Medical Info */}
                <div className="space-y-6">
                  {/* Symptoms */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptoms</h3>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <p className="text-red-800">{selectedAppointment.symptoms}</p>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  {selectedAppointment.diagnosis && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h3>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-green-800">{selectedAppointment.diagnosis}</p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedAppointment.notes && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor&apos;s Notes</h3>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-blue-800">{selectedAppointment.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {selectedAppointment.status === 'PENDING' && (
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Confirm Appointment
                        </button>
                      )}
                      
                      {(selectedAppointment.status === 'CONFIRMED' || selectedAppointment.status === 'PENDING') && (
                        <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Cancel Appointment
                        </button>
                      )}
                      
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Create Prescription
                      </button>
                      
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Schedule Follow-up
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 