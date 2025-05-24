"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface MedicalRecord {
  id: string;
  type: 'appointment' | 'prescription' | 'test_result' | 'diagnosis';
  title: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  content: string;
  status?: string;
  attachments?: string[];
  tags?: string[];
}

interface PatientProfile {
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  currentMedications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function PatientMedicalRecords() {
  const { user, isLoading: userLoading } = usePermissions();
  const [recordFilter, setRecordFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<string>('all');

  // Build API URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (recordFilter !== 'all') {
      params.append('type', recordFilter);
    }
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    if (dateRange !== 'all') {
      params.append('dateRange', dateRange);
    }
    params.append('limit', '100');
    return `/api/patient/medical-records?${params.toString()}`;
  };

  // Fetch medical records
  const { data: recordsData, error: recordsError, isLoading: recordsLoading, mutate } = useSWR<{records: MedicalRecord[]}>(
    buildApiUrl(),
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
      dedupingInterval: 60000
    }
  );

  // Fetch patient profile
  const { data: profileData, error: profileError, isLoading: profileLoading } = useSWR<{profile: PatientProfile}>(
    '/api/patient/profile',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 600000, // Refresh every 10 minutes
    }
  );

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const records = recordsData?.records || [];
  const profile = profileData?.profile || {};

  // Get type badge
  const getTypeBadge = (type: string) => {
    const typeConfig = {
      appointment: { color: 'bg-blue-100 text-blue-800', label: 'Appointment', icon: CalendarIcon },
      prescription: { color: 'bg-green-100 text-green-800', label: 'Prescription', icon: ClipboardDocumentListIcon },
      test_result: { color: 'bg-purple-100 text-purple-800', label: 'Test Result', icon: DocumentTextIcon },
      diagnosis: { color: 'bg-orange-100 text-orange-800', label: 'Diagnosis', icon: HeartIcon },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.appointment;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle export medical records
  const handleExportRecords = () => {
    const csvHeaders = [
      'Date',
      'Type',
      'Title',
      'Doctor',
      'Specialty',
      'Content',
      'Status'
    ];

    const csvRows = records.map(record => [
      formatDate(record.date),
      record.type,
      record.title,
      record.doctorName,
      record.doctorSpecialty,
      record.content.replace(/,/g, ';'),
      record.status || 'N/A'
    ]);

    const csvContent = [
      `Medical Records Export - ${user?.name}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle print medical records
  const handlePrintRecords = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Records - ${user?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .record { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .record-header { font-weight: bold; margin-bottom: 10px; }
          .record-meta { font-size: 12px; color: #666; margin-bottom: 10px; }
          .profile-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Medical Records</h1>
          <p>Patient: ${user?.name}</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="profile-info">
            ${profile.bloodType ? `<p><strong>Blood Type:</strong> ${profile.bloodType}</p>` : ''}
            ${profile.allergies?.length ? `<p><strong>Allergies:</strong> ${profile.allergies.join(', ')}</p>` : ''}
            ${profile.medicalHistory ? `<p><strong>Medical History:</strong> ${profile.medicalHistory}</p>` : ''}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Medical Records (${records.length} records)</div>
          ${records.map(record => `
            <div class="record">
              <div class="record-header">${record.title}</div>
              <div class="record-meta">
                ${formatDate(record.date)} • ${record.type.replace('_', ' ').toUpperCase()} • Dr. ${record.doctorName} (${record.doctorSpecialty})
              </div>
              <p>${record.content}</p>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
          <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
          <p className="text-gray-600 mt-1">
            Complete medical history, test results, and health information.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExportRecords}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handlePrintRecords}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Patient Profile Summary */}
      {!profileLoading && !profileError && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Blood Type</p>
              <p className="font-medium">{profile.bloodType || 'Not specified'}</p>
            </div>
                        <div>              <p className="text-sm text-gray-500">Allergies</p>              <p className="font-medium">                {profile.allergies || 'None known'}              </p>            </div>
            <div>
              <p className="text-sm text-gray-500">Current Medications</p>
              <p className="font-medium">
                {profile.currentMedications?.length || 0} active
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="font-medium">{records.length}</p>
            </div>
          </div>
          
          {profile.medicalHistory && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Medical History</p>
              <p className="text-gray-700">{profile.medicalHistory}</p>
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medical records, doctors, diagnoses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Record Type Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={recordFilter}
              onChange={(e) => setRecordFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Records</option>
              <option value="appointment">Appointments</option>
              <option value="prescription">Prescriptions</option>
              <option value="test_result">Test Results</option>
              <option value="diagnosis">Diagnoses</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {(searchTerm || recordFilter !== 'all' || dateRange !== 'all') && (
          <div className="mt-4 text-sm text-gray-600">
            Found {records.length} record{records.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Medical Records List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {recordsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : recordsError ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Error loading medical records. Please try again later.</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm || recordFilter !== 'all' || dateRange !== 'all' 
                ? 'No records match your criteria' 
                : 'No medical records found'}
            </p>
            <div className="flex justify-center space-x-3">
              <Link
                href="/doctors"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
              <Link
                href="/dashboard/patient/profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Update Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{record.title}</h3>
                      {getTypeBadge(record.type)}
                      {record.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          record.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(record.date)}
                      <span className="mx-2">•</span>
                      <UserIcon className="h-4 w-4 mr-1" />
                      Dr. {record.doctorName} ({record.doctorSpecialty})
                    </div>
                    
                    <p className="text-gray-700 mb-3">{record.content}</p>
                    
                    {record.tags && record.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {record.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        // View detailed record functionality
                        alert(`Viewing details for ${record.title}`);
                      }}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/patient/appointments"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Appointments</h3>
              <p className="text-sm text-gray-500">View appointment history</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/patient/prescriptions"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Prescriptions</h3>
              <p className="text-sm text-gray-500">View medications</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/patient/profile"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Profile</h3>
              <p className="text-sm text-gray-500">Update medical info</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}