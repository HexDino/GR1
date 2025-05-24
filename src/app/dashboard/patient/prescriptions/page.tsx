"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  ClipboardDocumentListIcon, 
  CalendarIcon,
  UserIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  BeakerIcon,
  ClockIcon,
  DocumentTextIcon,
  StarIcon,
  ShareIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ClockIcon as ClockIconSolid,
  BeakerIcon as BeakerIconSolid
} from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface PrescriptionItem {
  id: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  medicine: {
    name: string;
    genericName?: string;
    strength?: string;
    dosageForm?: string;
  };
}

interface Prescription {
  id: string;
  doctorName: string;
  doctorSpecialty?: string;
  mainMedication: string;
  medicationsCount: number;
  createdAt: string;
  expiryDate?: string;
  status: string;
  diagnosis?: string;
  notes?: string;
  items?: PrescriptionItem[];
  refillsRemaining?: number;
  pharmacy?: string;
}

export default function PatientPrescriptions() {
  const { user, isLoading: userLoading } = usePermissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    params.append('limit', '50');
    return `/api/patient/prescriptions?${params.toString()}`;
  };

  // Fetch prescriptions
  const { data: prescriptionsData, error: prescriptionsError, isLoading: prescriptionsLoading, mutate } = useSWR<{prescriptions: Prescription[]}>(
    buildApiUrl(),
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000,
      dedupingInterval: 60000
    }
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <ClipboardDocumentListIconSolid className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your prescriptions...</p>
        </div>
      </div>
    );
  }

  const prescriptions = prescriptionsData?.prescriptions || [];

  // Use only real data from API
  const displayPrescriptions = prescriptions;

  // Filter prescriptions based on search term
  const filteredPrescriptions = displayPrescriptions.filter(prescription => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      prescription.doctorName.toLowerCase().includes(searchLower) ||
      prescription.mainMedication.toLowerCase().includes(searchLower) ||
      prescription.diagnosis?.toLowerCase().includes(searchLower) ||
      prescription.pharmacy?.toLowerCase().includes(searchLower)
    );
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active', icon: CheckCircleIconSolid },
      EXPIRED: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Expired', icon: XCircleIconSolid },
      COMPLETED: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed', icon: CheckCircleIconSolid },
      CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', icon: XCircleIconSolid },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    mutate();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Export prescriptions as CSV
  const handleExportCSV = () => {
    if (filteredPrescriptions.length === 0) return;

    const csvHeaders = [
      'Prescription ID',
      'Doctor',
      'Main Medication',
      'Total Medications',
      'Status',
      'Issue Date',
      'Expiry Date',
      'Diagnosis'
    ];

    const csvRows = filteredPrescriptions.map(prescription => [
      prescription.id,
      prescription.doctorName,
      prescription.mainMedication,
      prescription.medicationsCount.toString(),
      prescription.status,
      formatDate(prescription.createdAt),
      prescription.expiryDate ? formatDate(prescription.expiryDate) : 'N/A',
      prescription.diagnosis || 'N/A'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescriptions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get statistics
  const stats = {
    total: filteredPrescriptions.length,
    active: filteredPrescriptions.filter(p => p.status === 'ACTIVE').length,
    completed: filteredPrescriptions.filter(p => p.status === 'COMPLETED').length,
    expired: filteredPrescriptions.filter(p => p.status === 'EXPIRED').length,
    expiringSoon: filteredPrescriptions.filter(p => {
      if (!p.expiryDate || p.status !== 'ACTIVE') return false;
      const daysUntilExpiry = getDaysUntilExpiry(p.expiryDate);
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-pattern-dots"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <ClipboardDocumentListIconSolid className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Prescriptions</h1>
                <p className="text-blue-100 text-lg">
                  Manage your medications and prescription history
                </p>
                <div className="flex items-center gap-4 mt-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{stats.active} active prescriptions</span>
                  </div>
                  {stats.expiringSoon > 0 && (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">{stats.expiringSoon} expiring soon</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExportCSV}
                disabled={filteredPrescriptions.length === 0}
                className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Export CSV
              </button>
              <button
                onClick={handleRefresh}
                className="group inline-flex items-center px-8 py-3 bg-white text-green-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <BeakerIconSolid className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p className="text-gray-600 text-sm font-medium">All Prescriptions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIconSolid className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</h3>
            <p className="text-gray-600 text-sm font-medium">Current</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Done</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</h3>
            <p className="text-gray-600 text-sm font-medium">Completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <XCircleIconSolid className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Past</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.expired}</h3>
            <p className="text-gray-600 text-sm font-medium">Expired</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ClockIconSolid className="w-6 h-6 text-yellow-600" />
              </div>
              {stats.expiringSoon > 0 && (
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full animate-pulse">Alert</span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.expiringSoon}</h3>
            <p className="text-gray-600 text-sm font-medium">Expiring Soon</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-2">Search Prescriptions</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by medication, doctor, pharmacy..."
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
                  <option value="all">All Prescriptions</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:w-48">
              <label className="block text-sm font-bold text-gray-900 mb-2">View Mode</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <BeakerIcon className="w-4 h-4 inline mr-1" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                <BeakerIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Prescriptions</h2>
                <p className="text-gray-600 text-sm">
                  {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {prescriptionsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : prescriptionsError ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Error loading prescriptions</p>
                <button 
                  onClick={handleRefresh}
                  className="text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No prescriptions found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchTerm 
                    ? `No prescriptions match your search criteria "${searchTerm}"`
                    : 'You haven\'t received any prescriptions yet.'
                  }
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredPrescriptions.map((prescription) => (
                  <div key={prescription.id} className={`group ${
                    viewMode === 'list' 
                      ? 'p-6 border-2 border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-green-50/30'
                      : 'p-6 border-2 border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center text-green-700 font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <BeakerIconSolid className="w-8 h-8" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-gray-100">
                            <span className="text-xs font-bold text-gray-600">{prescription.medicationsCount}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{prescription.mainMedication}</h3>
                          <p className="text-green-600 font-medium">Dr. {prescription.doctorName}</p>
                          {prescription.doctorSpecialty && (
                            <p className="text-gray-500 text-sm">{prescription.doctorSpecialty}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(prescription.status)}
                        {prescription.refillsRemaining !== undefined && prescription.refillsRemaining > 0 && (
                          <p className="text-xs text-blue-600 font-medium">
                            {prescription.refillsRemaining} refills left
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Issue Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(prescription.createdAt)}</span>
                      </div>
                      
                      {prescription.expiryDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Expires:</span>
                          <span className={`font-medium ${
                            prescription.status === 'ACTIVE' && getDaysUntilExpiry(prescription.expiryDate) <= 7
                              ? 'text-red-600' 
                              : 'text-gray-900'
                          }`}>
                            {formatDate(prescription.expiryDate)}
                            {prescription.status === 'ACTIVE' && (
                              <span className="ml-1 text-xs">
                                ({getDaysUntilExpiry(prescription.expiryDate)} days)
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Medications:</span>
                        <span className="font-medium text-gray-900">{prescription.medicationsCount} items</span>
                      </div>

                      {prescription.pharmacy && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Pharmacy:</span>
                          <span className="font-medium text-gray-900">{prescription.pharmacy}</span>
                        </div>
                      )}
                    </div>

                    {prescription.diagnosis && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Diagnosis:</span> {prescription.diagnosis}
                        </p>
                      </div>
                    )}

                    {prescription.notes && (
                      <div className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-sm text-yellow-900">
                          <span className="font-semibold">Notes:</span> {prescription.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Prescribed {formatDate(prescription.createdAt)}</span>
                      </div>
                      <div className="flex gap-2">
                        {prescription.status === 'ACTIVE' && prescription.refillsRemaining && prescription.refillsRemaining > 0 && (
                          <button className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-sm bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors">
                            <ShareIcon className="w-4 h-4" />
                            Refill
                          </button>
                        )}
                        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                          Details
                        </button>
                        <button className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold text-sm bg-purple-50 px-3 py-1 rounded-lg hover:bg-purple-100 transition-colors">
                          <PrinterIcon className="w-4 h-4" />
                          Print
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