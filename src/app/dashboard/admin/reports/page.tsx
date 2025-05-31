"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  ChartBarIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  StarIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

interface Report {
  id: string;
  title: string;
  type: 'FINANCIAL' | 'PATIENT' | 'DOCTOR' | 'APPOINTMENT' | 'GENERAL';
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  generatedAt: string;
  downloadUrl: string;
}

export default function ReportsManagement() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('generatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // API call would normally go to a dedicated reports API
  // For now, we'll use the dashboard stats API as a placeholder
  const apiUrl = `/api/admin/dashboard-stats`;

  // Fetch dashboard data
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

  // Mock reports data
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Monthly Financial Summary - January 2023',
      type: 'FINANCIAL',
      period: 'MONTHLY',
      generatedAt: new Date(2023, 0, 31).toISOString(),
      downloadUrl: '#'
    },
    {
      id: '2',
      title: 'Patient Registration Statistics - Q1 2023',
      type: 'PATIENT',
      period: 'QUARTERLY',
      generatedAt: new Date(2023, 2, 31).toISOString(),
      downloadUrl: '#'
    },
    {
      id: '3',
      title: 'Doctor Performance Review - February 2023',
      type: 'DOCTOR',
      period: 'MONTHLY',
      generatedAt: new Date(2023, 1, 28).toISOString(),
      downloadUrl: '#'
    },
    {
      id: '4',
      title: 'Appointment Analytics - Week 12, 2023',
      type: 'APPOINTMENT',
      period: 'WEEKLY',
      generatedAt: new Date(2023, 2, 24).toISOString(),
      downloadUrl: '#'
    },
    {
      id: '5',
      title: 'Annual Healthcare Summary - 2022',
      type: 'GENERAL',
      period: 'ANNUAL',
      generatedAt: new Date(2022, 11, 31).toISOString(),
      downloadUrl: '#'
    },
    {
      id: '6',
      title: 'Daily Patient Visit Report - March 15, 2023',
      type: 'PATIENT',
      period: 'DAILY',
      generatedAt: new Date(2023, 2, 15).toISOString(),
      downloadUrl: '#'
    },
    {
      id: '7',
      title: 'Monthly Revenue Report - March 2023',
      type: 'FINANCIAL',
      period: 'MONTHLY',
      generatedAt: new Date(2023, 2, 31).toISOString(),
      downloadUrl: '#'
    },
    {
      id: '8',
      title: 'Quarterly Staff Performance - Q1 2023',
      type: 'DOCTOR',
      period: 'QUARTERLY',
      generatedAt: new Date(2023, 2, 31).toISOString(),
      downloadUrl: '#'
    }
  ];

  // Filter and sort reports
  const filteredReports = mockReports
    .filter(report => {
      // Filter by type
      if (typeFilter !== 'all' && report.type !== typeFilter) {
        return false;
      }

      // Filter by period
      if (periodFilter !== 'all' && report.period !== periodFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortField === 'generatedAt') {
        return sortDirection === 'asc' 
          ? new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
          : new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
      } else if (sortField === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortField === 'type') {
        return sortDirection === 'asc'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      } else if (sortField === 'period') {
        return sortDirection === 'asc'
          ? a.period.localeCompare(b.period)
          : b.period.localeCompare(a.period);
      }
      return 0;
    });
  
  // Calculate pagination
  const totalReports = filteredReports.length;
  const totalPages = Math.ceil(totalReports / itemsPerPage);
  const currentReports = filteredReports.slice(
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FINANCIAL':
        return <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" />;
      case 'PATIENT':
        return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
      case 'DOCTOR':
        return <UserGroupIcon className="h-5 w-5 text-indigo-500" />;
      case 'APPOINTMENT':
        return <CalendarIcon className="h-5 w-5 text-amber-500" />;
      case 'GENERAL':
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FINANCIAL':
        return 'bg-emerald-100 text-emerald-800';
      case 'PATIENT':
        return 'bg-blue-100 text-blue-800';
      case 'DOCTOR':
        return 'bg-indigo-100 text-indigo-800';
      case 'APPOINTMENT':
        return 'bg-amber-100 text-amber-800';
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'DAILY':
        return 'bg-sky-100 text-sky-800';
      case 'WEEKLY':
        return 'bg-purple-100 text-purple-800';
      case 'MONTHLY':
        return 'bg-pink-100 text-pink-800';
      case 'QUARTERLY':
        return 'bg-orange-100 text-orange-800';
      case 'ANNUAL':
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

  const generateNewReport = () => {
    alert('This would open a modal to generate a new report in a real implementation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and view analytical reports
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
          <button
            onClick={generateNewReport}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5"
              >
                <option value="all">All Report Types</option>
                <option value="FINANCIAL">Financial</option>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="APPOINTMENT">Appointment</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>

          {/* Period Filter */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5"
              >
                <option value="all">All Time Periods</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading || swrLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 mb-6 flex justify-center items-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
              <StarIconSolid className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-gray-600 font-medium">Loading reports...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-md p-12 mb-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-gray-600 mb-6">There was an error loading the report data. Please try again later.</p>
            <button
              onClick={() => mutate()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Reports Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      onClick={() => handleSort('title')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Report Name</span>
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('type')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {sortField === 'type' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('period')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Period</span>
                        {sortField === 'period' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('generatedAt')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Generated Date</span>
                        {sortField === 'generatedAt' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                        No reports found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    currentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{report.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(report.type)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(report.type)}`}>
                              {report.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPeriodColor(report.period)}`}>
                            {report.period}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(report.generatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a 
                            href={report.downloadUrl}
                            className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 p-2 rounded-md inline-flex items-center"
                            download
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </a>
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
                Showing <span className="font-medium">{currentReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalReports)}</span> of{' '}
                <span className="font-medium">{totalReports}</span> results
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
                        ? 'z-10 bg-emerald-600 text-white'
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