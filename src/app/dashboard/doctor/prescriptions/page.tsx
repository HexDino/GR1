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
  PencilIcon,
  XMarkIcon,
  ClipboardDocumentListIcon
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
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch prescriptions - using mock data for now
  const mockPrescriptions: Prescription[] = [
    {
      id: '1',
      patientName: 'Nguyen Van A',
      patientId: 'PAT001',
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: '3 times daily',
          duration: '7 days',
          instructions: 'Take with food'
        },
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'As needed',
          duration: '5 days',
          instructions: 'For fever and pain relief'
        }
      ],
      diagnosis: 'Upper respiratory tract infection',
      notes: 'Patient should rest and drink plenty of fluids. Follow up if symptoms persist.',
      createdAt: '2025-01-06T10:30:00Z',
      status: 'ACTIVE',
      followUpDate: '2025-01-13T10:30:00Z'
    },
    {
      id: '2',
      patientName: 'Tran Thi B',
      patientId: 'PAT002',
      medications: [
        {
          name: 'Metformin',
          dosage: '850mg',
          frequency: '2 times daily',
          duration: '30 days',
          instructions: 'Take with meals'
        }
      ],
      diagnosis: 'Type 2 Diabetes Mellitus',
      notes: 'Monitor blood glucose levels regularly. Diet and exercise counseling provided.',
      createdAt: '2025-01-05T14:15:00Z',
      status: 'ACTIVE',
      followUpDate: '2025-02-05T14:15:00Z'
    },
    {
      id: '3',
      patientName: 'Le Van C',
      patientId: 'PAT003',
      medications: [
        {
          name: 'Omeprazole',
          dosage: '20mg',
          frequency: 'Once daily',
          duration: '14 days',
          instructions: 'Take before breakfast'
        }
      ],
      diagnosis: 'Gastroesophageal reflux disease (GERD)',
      notes: 'Avoid spicy foods, caffeine, and late-night meals.',
      createdAt: '2025-01-04T09:00:00Z',
      status: 'COMPLETED'
    },
    {
      id: '4',
      patientName: 'Pham Thi D',
      patientId: 'PAT004',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take at the same time each day'
        }
      ],
      diagnosis: 'Hypertension',
      notes: 'Monitor blood pressure weekly. Lifestyle modifications discussed.',
      createdAt: '2025-01-03T11:45:00Z',
      status: 'CANCELLED'
    }
  ];

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
      keepPreviousData: true,
      fallbackData: {
        success: true,
        prescriptions: mockPrescriptions,
        total: mockPrescriptions.length
      }
    }
  );

  const prescriptions = prescriptionsResponse?.prescriptions || mockPrescriptions;

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

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintPrescription = (prescription: Prescription) => {
    // Create a new window for printing the prescription
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrescriptionHTML(prescription));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrescriptionHTML = (prescription: Prescription) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${prescription.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .medication { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
            .label { font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Prescription</h1>
            <p>Dr. ${user?.name || 'Doctor Name'}</p>
            <p>Date: ${new Date(prescription.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Patient Information</h2>
            <p><span class="label">Name:</span> ${prescription.patientName}</p>
            <p><span class="label">Patient ID:</span> ${prescription.patientId}</p>
            <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Diagnosis</h2>
            <p>${prescription.diagnosis}</p>
          </div>
          
          <div class="section">
            <h2>Medications</h2>
            ${prescription.medications.map(med => `
              <div class="medication">
                <p><span class="label">Medication:</span> ${med.name}</p>
                <p><span class="label">Dosage:</span> ${med.dosage}</p>
                <p><span class="label">Frequency:</span> ${med.frequency}</p>
                <p><span class="label">Duration:</span> ${med.duration}</p>
                ${med.instructions ? `<p><span class="label">Instructions:</span> ${med.instructions}</p>` : ''}
              </div>
            `).join('')}
          </div>
          
          ${prescription.notes ? `
            <div class="section">
              <h2>Additional Notes</h2>
              <p>${prescription.notes}</p>
            </div>
          ` : ''}
          
          <div class="section" style="margin-top: 50px;">
            <p>Doctor&apos;s Signature: _______________________</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
  };

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
        <h1>Prescription Management Report</h1>
        <p>Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
              <p className="text-gray-600 mt-1">Manage and track patient prescriptions</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Report
              </button>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 no-print">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prescriptions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h2 className="text-xl font-bold">
                Prescription Records ({filteredPrescriptions.length} prescriptions)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-6 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
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
                    
                    <div className="flex flex-col space-y-2 no-print">
                      <button 
                        onClick={() => handleViewDetails(prescription)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      <button 
                        onClick={() => handlePrintPrescription(prescription)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                      >
                        <PrinterIcon className="h-4 w-4 mr-1" />
                        Print Prescription
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {showDetailModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
                <p className="text-gray-600">Complete prescription information</p>
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
                {/* Left Column - Patient & Prescription Info */}
                <div className="space-y-6">
                  {/* Patient Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Patient Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Patient Name</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedPrescription.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Patient ID</p>
                        <p className="text-gray-900">{selectedPrescription.patientId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        {getStatusBadge(selectedPrescription.status)}
                      </div>
                    </div>
                  </div>

                  {/* Prescription Details */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Prescription Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date Created</p>
                        <p className="text-gray-900">{formatDateTime(selectedPrescription.createdAt)}</p>
                      </div>
                      
                      {selectedPrescription.followUpDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Follow-up Date</p>
                          <p className="text-gray-900">{formatDateTime(selectedPrescription.followUpDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Medical Info */}
                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-blue-800">{selectedPrescription.diagnosis}</p>
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Medications</h3>
                    <div className="space-y-4">
                      {selectedPrescription.medications.map((medication, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <h4 className="font-semibold text-green-800 mb-2">{medication.name}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-green-700">Dosage:</span>
                              <p className="text-green-800">{medication.dosage}</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-700">Frequency:</span>
                              <p className="text-green-800">{medication.frequency}</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-700">Duration:</span>
                              <p className="text-green-800">{medication.duration}</p>
                            </div>
                            {medication.instructions && (
                              <div className="col-span-2">
                                <span className="font-medium text-green-700">Instructions:</span>
                                <p className="text-green-800">{medication.instructions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedPrescription.notes && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <p className="text-yellow-800">{selectedPrescription.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handlePrintPrescription(selectedPrescription)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Prescription
              </button>
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