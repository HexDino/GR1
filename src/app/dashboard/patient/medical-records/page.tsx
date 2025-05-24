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
  ArrowPathIcon,
  FolderIcon,
  ShareIcon,
  BeakerIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  TagIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { 
  DocumentTextIcon as DocumentTextIconSolid,
  HeartIcon as HeartIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  CalendarIcon as CalendarIconSolid,
  BeakerIcon as BeakerIconSolid
} from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface MedicalRecord {
  id: string;
  type: 'appointment' | 'prescription' | 'test_result' | 'diagnosis' | 'vaccination' | 'surgery';
  title: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  content: string;
  status?: string;
  attachments?: string[];
  tags?: string[];
  facility?: string;
  notes?: string;
}

interface PatientProfile {
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  currentMedications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  height?: string;
  weight?: string;
  insuranceProvider?: string;
}

export default function PatientMedicalRecords() {
  const { user, isLoading: userLoading } = usePermissions();
  const [recordFilter, setRecordFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
      refreshInterval: 300000,
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
      refreshInterval: 600000,
    }
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <DocumentTextIconSolid className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your medical records...</p>
        </div>
      </div>
    );
  }

  const records = recordsData?.records || [];
  const profile = profileData?.profile || {};

  // Use only real data from API
  const displayRecords = records;

  // Filter records based on search term
  const filteredRecords = displayRecords.filter(record => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      record.title.toLowerCase().includes(searchLower) ||
      record.doctorName.toLowerCase().includes(searchLower) ||
      record.doctorSpecialty.toLowerCase().includes(searchLower) ||
      record.content.toLowerCase().includes(searchLower) ||
      record.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Get type badge
  const getTypeBadge = (type: string) => {
    const typeConfig = {
      appointment: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Appointment', icon: CalendarIconSolid },
      prescription: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Prescription', icon: ClipboardDocumentListIconSolid },
      test_result: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Test Result', icon: BeakerIconSolid },
      diagnosis: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Diagnosis', icon: HeartIconSolid },
      vaccination: { color: 'bg-pink-100 text-pink-800 border-pink-200', label: 'Vaccination', icon: ShieldCheckIcon },
      surgery: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Surgery', icon: UserIcon },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.appointment;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarIconSolid className="w-6 h-6" />;
      case 'prescription':
        return <ClipboardDocumentListIconSolid className="w-6 h-6" />;
      case 'test_result':
        return <BeakerIconSolid className="w-6 h-6" />;
      case 'diagnosis':
        return <HeartIconSolid className="w-6 h-6" />;
      case 'vaccination':
        return <ShieldCheckIcon className="w-6 h-6" />;
      default:
        return <DocumentTextIconSolid className="w-6 h-6" />;
    }
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
    if (filteredRecords.length === 0) return;

    const csvHeaders = [
      'Date',
      'Type',
      'Title',
      'Doctor',
      'Specialty',
      'Content',
      'Status',
      'Facility'
    ];

    const csvRows = filteredRecords.map(record => [
      formatDate(record.date),
      record.type,
      record.title,
      record.doctorName,
      record.doctorSpecialty,
      record.content.replace(/,/g, ';'),
      record.status || 'N/A',
      record.facility || 'N/A'
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

  // Handle refresh
  const handleRefresh = () => {
    mutate();
  };

  // Get statistics
  const stats = {
    total: filteredRecords.length,
    appointments: filteredRecords.filter(r => r.type === 'appointment').length,
    prescriptions: filteredRecords.filter(r => r.type === 'prescription').length,
    testResults: filteredRecords.filter(r => r.type === 'test_result').length,
    diagnoses: filteredRecords.filter(r => r.type === 'diagnosis').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-pattern-dots"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <DocumentTextIconSolid className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Medical Records</h1>
                <p className="text-blue-100 text-lg">
                  Complete medical history and health documentation
                </p>
                <div className="flex items-center gap-4 mt-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{stats.total} records available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExportRecords}
                disabled={filteredRecords.length === 0}
                className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Export Records
              </button>
              <button
                onClick={handleRefresh}
                className="group inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2 group-hover:animate-spin" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FolderIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p className="text-gray-600 text-sm font-medium">All Records</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIconSolid className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Visits</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.appointments}</h3>
            <p className="text-gray-600 text-sm font-medium">Appointments</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ClipboardDocumentListIconSolid className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Meds</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.prescriptions}</h3>
            <p className="text-gray-600 text-sm font-medium">Prescriptions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BeakerIconSolid className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Tests</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.testResults}</h3>
            <p className="text-gray-600 text-sm font-medium">Test Results</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <HeartIconSolid className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">Health</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.diagnoses}</h3>
            <p className="text-gray-600 text-sm font-medium">Diagnoses</p>
          </div>
        </div>

        {/* Health Profile Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Health Profile Summary</h2>
              <p className="text-gray-600 text-sm">Your basic health information and emergency contacts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <HeartIcon className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Blood Type</h3>
              </div>
              <p className="text-lg font-bold text-red-700">{profile.bloodType || 'Not specified'}</p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Allergies</h3>
              </div>
              <p className="text-sm text-yellow-700">
                {profile.allergies && profile.allergies.trim().length > 0 
                  ? profile.allergies 
                  : 'No known allergies'}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Vitals</h3>
              </div>
              <p className="text-sm text-blue-700">
                Height: {profile.height || 'Not recorded'}<br />
                Weight: {profile.weight || 'Not recorded'}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Insurance</h3>
              </div>
              <p className="text-sm text-green-700">{profile.insuranceProvider || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-2">Search Records</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, doctor, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="lg:w-64">
              <label className="block text-sm font-bold text-gray-900 mb-2">Filter by Type</label>
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={recordFilter}
                  onChange={(e) => setRecordFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="all">All Records</option>
                  <option value="appointment">Appointments</option>
                  <option value="prescription">Prescriptions</option>
                  <option value="test_result">Test Results</option>
                  <option value="diagnosis">Diagnoses</option>
                  <option value="vaccination">Vaccinations</option>
                  <option value="surgery">Surgeries</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:w-48">
              <label className="block text-sm font-bold text-gray-900 mb-2">View Mode</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Bars3Icon className="w-4 h-4 inline mr-1" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FolderIcon className="w-4 h-4 inline mr-1" />
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
                <p className="text-gray-600 text-sm">
                  {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {recordsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <DocumentTextIcon className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : recordsError ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Error loading medical records</p>
                <button 
                  onClick={handleRefresh}
                  className="text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No medical records found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchTerm 
                    ? `No records match your search criteria "${searchTerm}"`
                    : 'Your medical records will appear here as you receive care.'
                  }
                </p>
                <Link
                  href="/doctors"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Book Your First Appointment
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredRecords.map((record) => (
                  <div key={record.id} className={`group ${
                    viewMode === 'list' 
                      ? 'p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-indigo-50/30'
                      : 'p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-indigo-50/30'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                            {getTypeIcon(record.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{record.title}</h3>
                          <p className="text-indigo-600 font-medium">Dr. {record.doctorName}</p>
                          <p className="text-gray-500 text-sm">{record.doctorSpecialty}</p>
                          {record.facility && (
                            <p className="text-gray-400 text-xs mt-1">{record.facility}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {getTypeBadge(record.type)}
                        <p className="text-xs text-gray-500 font-medium">
                          {formatDate(record.date)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {record.content}
                      </p>
                    </div>

                    {record.tags && record.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {record.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Recorded on {formatDate(record.date)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                          View
                        </button>
                        <button className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-sm bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors">
                          <ShareIcon className="w-4 h-4" />
                          Share
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