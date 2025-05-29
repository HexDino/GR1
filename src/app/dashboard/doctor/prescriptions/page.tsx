"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  EyeIcon,
  PrinterIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  diagnosis: string;
  notes?: string;
  createdAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  followUpDate?: string;
}

export default function DoctorPrescriptions() {
  const { user, isLoading: userLoading } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'patient' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch prescriptions
  const { data: prescriptionsResponse, error, isLoading, mutate } = useSWR<{
    success: boolean;
    prescriptions: Prescription[];
    total: number;
  }>(
    user ? '/api/doctor/prescriptions' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // 5 minutes
      keepPreviousData: true
    }
  );

  const prescriptions = prescriptionsResponse?.prescriptions || [];

  // Filter and sort prescriptions
  const filteredPrescriptions = useMemo(() => {
    let filtered = prescriptions.filter(prescription => {
      const matchesSearch = 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === 'ALL' || prescription.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [prescriptions, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'ACTIVE':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Active</span>;
      case 'COMPLETED':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Completed</span>;
      case 'CANCELLED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Prescriptions
              </h1>
              <p className="text-gray-600 mt-1">Manage and track patient prescriptions</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/doctor/prescriptions/create"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Prescription
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, diagnosis, or medication..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'date' | 'patient' | 'status');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="patient-asc">Patient A-Z</option>
                <option value="patient-desc">Patient Z-A</option>
                <option value="status-asc">Status A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{prescriptions.length}</h3>
                <p className="text-sm text-gray-600">Total Prescriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'ACTIVE').length}
                </h3>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'COMPLETED').length}
                </h3>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.followUpDate && new Date(p.followUpDate) <= new Date()).length}
                </h3>
                <p className="text-sm text-gray-600">Follow-ups Due</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prescriptions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Prescriptions</h3>
            <p className="text-gray-600 mb-4">Failed to load prescription data</p>
            <button
              onClick={() => mutate()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !error && filteredPrescriptions.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'No prescriptions match your search criteria.'
                : 'You haven\'t created any prescriptions yet.'}
            </p>
            <Link
              href="/dashboard/doctor/prescriptions/create"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create First Prescription
            </Link>
          </div>
        )}

        {/* Prescriptions List */}
        {!isLoading && !error && filteredPrescriptions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white">
              <h2 className="text-xl font-bold">
                Prescription Records ({filteredPrescriptions.length} prescriptions)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-6 hover:bg-purple-25 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                        <DocumentTextIcon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {prescription.patientName}
                          </h3>
                          {getStatusBadge(prescription.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Diagnosis:</span><br />
                            <span className="text-gray-900">{prescription.diagnosis}</span>
                          </div>
                          <div>
                            <span className="font-medium">Medications:</span><br />
                            <span className="text-gray-900">
                              {prescription.medications.length} medication(s)
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Date Created:</span><br />
                            <span className="text-gray-900">{formatDate(prescription.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center">
                        <PrinterIcon className="h-4 w-4 mr-1" />
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 