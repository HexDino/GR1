"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
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

export default function DoctorsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  // Temporarily use the users API with role=DOCTOR filter
  const apiUrl = `/api/admin/users?role=DOCTOR&status=${statusFilter}&page=${currentPage}&limit=${itemsPerPage}&sort=${sortField}&direction=${sortDirection}&search=${searchTerm}`;

  // Fetch doctors data
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

  // Extract the doctors from API response or use empty array as fallback
  const doctors = data?.users || [];
  
  // Get pagination data from API or use defaults
  const totalDoctors = data?.pagination?.totalUsers || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!confirm(`Are you sure you want to delete doctor ${doctorName}?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${doctorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
        alert(`Doctor ${doctorName} was deleted successfully`);
      } else {
        throw new Error('Failed to delete doctor');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Error deleting doctor. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-700">
            Doctor Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all doctors in the system
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
            title="Refresh data"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/dashboard/admin/doctors/add"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Add Doctor</span>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 transition-all"
                placeholder="Search by name, email, specialty or phone..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 appearance-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading || swrLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6 flex justify-center items-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-14 h-14 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
              <StarIconSolid className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-gray-600 font-medium text-sm mt-2">Loading doctors...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-14 h-14 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Doctors</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">There was an error loading the doctor data. Please try again later.</p>
            <button
              onClick={() => mutate()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Doctors Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      onClick={() => handleSort('name')}
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Name</span>
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-3.5 w-3.5" /> : 
                            <ArrowDownIcon className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('email')}
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Email</span>
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-3.5 w-3.5" /> : 
                            <ArrowDownIcon className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('department')}
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Department</span>
                        {sortField === 'department' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-3.5 w-3.5" /> : 
                            <ArrowDownIcon className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-3.5 w-3.5" /> : 
                            <ArrowDownIcon className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('createdAt')}
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Joined</span>
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-3.5 w-3.5" /> : 
                            <ArrowDownIcon className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 whitespace-nowrap text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ExclamationTriangleIcon className="h-10 w-10 text-gray-300" />
                          <p>No doctors found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor: any) => (
                      <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {doctor.profileImage ? (
                                <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={doctor.profileImage} alt={doctor.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-700 font-medium text-sm">
                                    {doctor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                              {doctor.phone && (
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <PhoneIcon className="h-3 w-3" />
                                  {doctor.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                            {doctor.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.department || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getStatusColor(doctor.status)}`}>
                            {doctor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(doctor.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1.5">
                            <Link href={`/dashboard/admin/doctors/${doctor.id}`}>
                              <span className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-md transition-colors">
                                <EyeIcon className="h-5 w-5" />
                              </span>
                            </Link>
                            <Link href={`/dashboard/admin/doctors/edit/${doctor.id}`}>
                              <span className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-colors">
                                <PencilIcon className="h-5 w-5" />
                              </span>
                            </Link>
                            <button 
                              onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 gap-4">
            <div className="flex items-center text-sm text-gray-700">
              Showing <span className="font-medium mx-1">{doctors.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
              <span className="font-medium mx-1">{Math.min(currentPage * itemsPerPage, totalDoctors)}</span> of{' '}
              <span className="font-medium mx-1">{totalDoctors}</span> results
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-200'
                } transition-colors`}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
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
                    className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'z-10 bg-indigo-600 text-white'
                        : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-200'
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-200'
                } transition-colors`}
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 