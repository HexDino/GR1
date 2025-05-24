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
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

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
  mainMedication: string;
  medicationsCount: number;
  createdAt: string;
  expiryDate?: string;
  status: string;
  diagnosis?: string;
  notes?: string;
  items?: PrescriptionItem[];
}

export default function PatientPrescriptions() {
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
    return `/api/patient/prescriptions?${params.toString()}`;
  };

  // Fetch prescriptions
  const { data: prescriptionsData, error: prescriptionsError, isLoading: prescriptionsLoading, mutate } = useSWR<{prescriptions: Prescription[]}>(
    buildApiUrl(),
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
      dedupingInterval: 60000
    }
  );

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const prescriptions = prescriptionsData?.prescriptions || [];

  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      prescription.doctorName.toLowerCase().includes(searchLower) ||
      prescription.mainMedication.toLowerCase().includes(searchLower) ||
      prescription.diagnosis?.toLowerCase().includes(searchLower)
    );
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircleIcon },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', label: 'Expired', icon: XCircleIcon },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: CheckCircleIcon },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Prescriptions</h1>
          <p className="text-gray-600 mt-1">
            View and manage your prescription history and medication details.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredPrescriptions.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
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
                placeholder="Search by doctor, medication, diagnosis..."
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
              <option value="all">All Prescriptions</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {prescriptionsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : prescriptionsError ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Error loading prescriptions. Please try again later.</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {prescriptions.length === 0 ? 'No prescriptions found' : 'No prescriptions match your search'}
            </p>
            <Link
              href="/doctors"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Book Appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <ClipboardDocumentListIcon className="h-6 w-6" />
                    </div>

                    {/* Prescription Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{prescription.mainMedication}</p>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <p className="text-sm text-gray-500">Prescribed by Dr. {prescription.doctorName}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(prescription.createdAt)}
                        <span className="mx-2">•</span>
                        <span>{prescription.medicationsCount} medication{prescription.medicationsCount !== 1 ? 's' : ''}</span>
                        {prescription.expiryDate && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Expires {formatDate(prescription.expiryDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/patient/prescriptions/${prescription.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </div>
                </div>

                {/* Additional Details */}
                {prescription.diagnosis && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Diagnosis: </span>
                      <span className="text-sm text-gray-600">{prescription.diagnosis}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {!prescriptionsLoading && !prescriptionsError && prescriptions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="text-center text-sm text-gray-600">
            Showing {filteredPrescriptions.length} of {prescriptions.length} total prescriptions
          </div>
        </div>
      )}
    </div>
  );
} 