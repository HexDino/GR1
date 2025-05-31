"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'PENDING';
  reason?: string;
}

export default function PendingAppointments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  // API call would normally go to a dedicated appointments API
  // For now, we'll mock this data
  const apiUrl = `/api/admin/dashboard-stats`; // This will be changed to actual appointments API later

  // Fetch appointments data
  const { 
    data, 
    error, 
    isLoading: swrLoading, 
    mutate 
  } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 300000, // 5 minutes
    onSuccess: () => {
      if (isLoading) setIsLoading(false);
    },
    onError: () => {
      if (isLoading) setIsLoading(false);
    }
  });

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock pending appointments data
  // In a real implementation, this would come from the API
  const mockPendingAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'John Doe',
      doctorName: 'Dr. Sarah Johnson',
      date: new Date().toISOString(),
      time: '09:00 AM',
      status: 'PENDING',
      reason: 'Annual checkup'
    },
    {
      id: '6',
      patientName: 'Sophia Martinez',
      doctorName: 'Dr. Mark Wilson',
      date: new Date(Date.now() + 2 * 86400000).toISOString(), // 2 days from now
      time: '08:30 AM',
      status: 'PENDING',
      reason: 'Headache and dizziness'
    },
    {
      id: '7',
      patientName: 'William Taylor',
      doctorName: 'Dr. Jennifer Lee',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      time: '01:15 PM',
      status: 'PENDING',
      reason: 'Skin rash'
    },
    {
      id: '8',
      patientName: 'Olivia Johnson',
      doctorName: 'Dr. Sarah Johnson',
      date: new Date(Date.now() + 4 * 86400000).toISOString(), // 4 days from now
      time: '11:30 AM',
      status: 'PENDING',
      reason: 'Pregnancy consultation'
    },
    {
      id: '9',
      patientName: 'James Wilson',
      doctorName: 'Dr. Michael Chen',
      date: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days from now
      time: '04:00 PM',
      status: 'PENDING',
      reason: 'Back pain'
    }
  ];

  // Filter and sort appointments
  const pendingAppointments = mockPendingAppointments
    .filter(appointment => {
      // Filter by search term
      if (searchTerm && !appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === 'patientName') {
        return sortDirection === 'asc'
          ? a.patientName.localeCompare(b.patientName)
          : b.patientName.localeCompare(a.patientName);
      } else if (sortField === 'doctorName') {
        return sortDirection === 'asc'
          ? a.doctorName.localeCompare(b.doctorName)
          : b.doctorName.localeCompare(a.doctorName);
      }
      return 0;
    });
  
  // Calculate pagination
  const totalAppointments = pendingAppointments.length;
  const totalPages = Math.ceil(totalAppointments / itemsPerPage);
  const currentAppointments = pendingAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApprove = (id: string) => {
    alert(`Appointment ${id} would be approved in a real implementation`);
    // In a real implementation, you would call an API to update the status
    // and then refresh the data
    mutate();
  };

  const handleReject = (id: string) => {
    alert(`Appointment ${id} would be rejected in a real implementation`);
    // In a real implementation, you would call an API to update the status
    // and then refresh the data
    mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Pending Appointments
          </h1>
          <p className="text-gray-600 mt-1">
            Review and manage pending appointment requests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <Link
            href="/dashboard/admin/appointments"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            All Appointments
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-10 p-2.5"
            placeholder="Search by patient or doctor name..."
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading || swrLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 mb-6 flex justify-center items-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
              <StarIconSolid className="w-6 h-6 text-yellow-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-gray-600 font-medium">Loading pending appointments...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-md p-12 mb-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Appointments</h3>
            <p className="text-gray-600 mb-6">There was an error loading the appointment data. Please try again later.</p>
            <button
              onClick={() => mutate()}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Pending Appointments Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      onClick={() => handleSort('date')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date & Time</span>
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('patientName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Patient</span>
                        {sortField === 'patientName' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('doctorName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Doctor</span>
                        {sortField === 'doctorName' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Reason</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                        No pending appointments found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    currentAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {appointment.time}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.reason || "Not specified"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/dashboard/admin/appointments/${appointment.id}`}>
                              <span className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-md">
                                <EyeIcon className="h-5 w-5" />
                              </span>
                            </Link>
                            <button 
                              onClick={() => handleApprove(appointment.id)}
                              className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-md"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleReject(appointment.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-md">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{currentAppointments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalAppointments)}</span> of{' '}
                <span className="font-medium">{totalAppointments}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show appropriate page numbers
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'z-10 bg-yellow-600 text-white'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Next
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 