"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PrinterIcon, 
  XMarkIcon, 
  EyeIcon, 
  CalendarIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  HeartIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  lastVisit: string | null;
  lastVisitText: string;
  lastDiagnosis: string;
  lastSymptoms: string;
  appointmentCount: number;
  lastStatus: string | null;
  medicalHistory?: string[];
  currentMedications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientFilters {
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
  activePatients: number;
  newPatients: number;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 20,
    offset: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    activePatients: 0,
    newPatients: 0
  });
  
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Mock data for better testing
  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'Hoang Van Duc',
      email: 'hvduc@email.com',
      phone: '0901234571',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      bloodType: 'A+',
      allergies: 'Penicillin, Shellfish',
      lastVisit: '2025-04-16',
      lastVisitText: '4/16/2025',
      lastDiagnosis: 'Type 2 Diabetes',
      lastSymptoms: 'Persistent fatigue',
      appointmentCount: 8,
      lastStatus: 'COMPLETED',
      medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'High Cholesterol'],
      currentMedications: ['Metformin 850mg', 'Lisinopril 10mg', 'Atorvastatin 20mg'],
      emergencyContact: {
        name: 'Nguyen Thi Mai',
        phone: '0987654321',
        relationship: 'Spouse'
      },
      address: '123 Nguyen Trai, District 1, Ho Chi Minh City',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2025-04-16T14:30:00Z'
    },
    {
      id: '2',
      name: 'Le Van Cuong',
      email: 'lvcuong@email.com',
      phone: '0901234569',
      dateOfBirth: '1992-07-22',
      gender: 'Male',
      bloodType: 'O+',
      allergies: 'None known',
      lastVisit: '2025-04-13',
      lastVisitText: '4/13/2025',
      lastDiagnosis: 'Pneumonia',
      lastSymptoms: 'Weight loss concerns',
      appointmentCount: 3,
      lastStatus: 'COMPLETED',
      medicalHistory: ['Asthma', 'Pneumonia'],
      currentMedications: ['Albuterol inhaler', 'Amoxicillin 500mg'],
      emergencyContact: {
        name: 'Le Thi Hong',
        phone: '0912345678',
        relationship: 'Mother'
      },
      address: '456 Le Loi, District 3, Ho Chi Minh City',
      createdAt: '2024-11-10T09:15:00Z',
      updatedAt: '2025-04-13T11:20:00Z'
    },
    {
      id: '3',
      name: 'Ngo Van Minh',
      email: 'nvminh@email.com',
      phone: '0901234575',
      dateOfBirth: '1978-12-08',
      gender: 'Male',
      bloodType: 'B+',
      allergies: 'Aspirin',
      lastVisit: '2025-03-12',
      lastVisitText: '3/12/2025',
      lastDiagnosis: 'No diagnosis',
      lastSymptoms: 'Abdominal pain',
      appointmentCount: 1,
      lastStatus: 'PENDING',
      medicalHistory: ['Gastritis'],
      currentMedications: ['Omeprazole 20mg'],
      emergencyContact: {
        name: 'Ngo Thi Lan',
        phone: '0923456789',
        relationship: 'Sister'
      },
      address: '789 Hai Ba Trung, District 1, Ho Chi Minh City',
      createdAt: '2025-02-20T08:30:00Z',
      updatedAt: '2025-03-12T10:45:00Z'
    },
    {
      id: '4',
      name: 'Pham Thi Dung',
      email: 'ptdung@email.com',
      phone: '0901234570',
      dateOfBirth: '1988-05-30',
      gender: 'Female',
      bloodType: 'AB+',
      allergies: 'Latex, Peanuts',
      lastVisit: '2025-05-26',
      lastVisitText: '5/26/2025',
      lastDiagnosis: 'Eczema',
      lastSymptoms: 'Diabetes management',
      appointmentCount: 12,
      lastStatus: 'ACTIVE',
      medicalHistory: ['Eczema', 'Type 1 Diabetes', 'Thyroid disorder'],
      currentMedications: ['Insulin', 'Levothyroxine 50mcg', 'Hydrocortisone cream'],
      emergencyContact: {
        name: 'Pham Van Long',
        phone: '0934567890',
        relationship: 'Husband'
      },
      address: '321 Tran Hung Dao, District 5, Ho Chi Minh City',
      createdAt: '2023-08-15T14:20:00Z',
      updatedAt: '2025-05-26T16:10:00Z'
    },
    {
      id: '5',
      name: 'Tran Thi Binh',
      email: 'ttbinh@email.com',
      phone: '0901234568',
      dateOfBirth: '1995-11-18',
      gender: 'Female',
      bloodType: 'O-',
      allergies: 'Sulfa drugs',
      lastVisit: '2025-03-31',
      lastVisitText: '3/31/2025',
      lastDiagnosis: 'Acid reflux',
      lastSymptoms: 'Back pain',
      appointmentCount: 5,
      lastStatus: 'COMPLETED',
      medicalHistory: ['GERD', 'Lower back pain'],
      currentMedications: ['Omeprazole 40mg', 'Ibuprofen 400mg'],
      emergencyContact: {
        name: 'Tran Van Duc',
        phone: '0945678901',
        relationship: 'Father'
      },
      address: '654 Vo Van Tan, District 3, Ho Chi Minh City',
      createdAt: '2024-06-10T11:45:00Z',
      updatedAt: '2025-03-31T13:25:00Z'
    }
  ];

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPatients(mockPatients);
      setPagination({
        total: mockPatients.length,
        limit: 20,
        offset: 0,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
      setSummary({
        total: mockPatients.length,
        activePatients: mockPatients.filter(p => p.appointmentCount > 0 && p.lastVisit && 
          (Date.now() - new Date(p.lastVisit).getTime()) < 30 * 24 * 60 * 60 * 1000).length,
        newPatients: mockPatients.filter(p => p.appointmentCount <= 1).length
      });
    } catch (err) {
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [filters, pagination.offset]);

  const handleFilterChange = (key: keyof PatientFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * pagination.limit;
    setPagination(prev => ({ ...prev, offset: newOffset, page: newPage }));
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const getConditionColor = (condition: string) => {
    const normalizedCondition = condition.toLowerCase();
    if (normalizedCondition.includes('heart') || normalizedCondition.includes('cardiac')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (normalizedCondition.includes('diabetes')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (normalizedCondition.includes('hypertension') || normalizedCondition.includes('blood pressure')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (normalizedCondition.includes('asthma') || normalizedCondition.includes('pneumonia')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (normalizedCondition.includes('eczema')) {
      return 'bg-pink-100 text-pink-800 border-pink-200';
    }
    if (normalizedCondition.includes('reflux') || normalizedCondition.includes('acid')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const getPriorityLevel = (appointmentCount: number, lastVisit: string | null) => {
    if (!lastVisit) return { level: 'New', color: 'bg-blue-100 text-blue-800' };
    
    const daysSinceLastVisit = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit > 90) return { level: 'Follow-up needed', color: 'bg-red-100 text-red-800' };
    if (daysSinceLastVisit > 30) return { level: 'Check-in', color: 'bg-yellow-100 text-yellow-800' };
    if (appointmentCount >= 5) return { level: 'Regular', color: 'bg-green-100 text-green-800' };
    return { level: 'Active', color: 'bg-purple-100 text-purple-800' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
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
        <h1>Patient Management Report</h1>
        <p>Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Patients
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and view your patients
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Report
              </button>
              <button className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{summary.total}</h3>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HeartIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{summary.activePatients}</h3>
                <p className="text-sm text-gray-600">Active Patients</p>
                <p className="text-xs text-gray-500">(visited in last 30 days)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{summary.newPatients}</h3>
                <p className="text-sm text-gray-600">New Patients</p>
                <p className="text-xs text-gray-500">(first-time visits)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 no-print">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Patients</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="name">Name</option>
                <option value="lastVisit">Last Visit</option>
                <option value="appointmentCount">Visit Count</option>
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
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">
              Patient Records ({pagination.total} patients)
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-600">Loading patients...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500">No patients match your search criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {patients.map((patient) => {
                const priority = getPriorityLevel(patient.appointmentCount, patient.lastVisit);
                
                return (
                  <div key={patient.id} className="p-6 hover:bg-purple-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Patient Avatar */}
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {patient.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priority.color}`}>
                              {priority.level}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConditionColor(patient.lastDiagnosis)}`}>
                              {patient.lastDiagnosis}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Contact:</span><br />
                              <span className="text-gray-900">{patient.email}</span><br />
                              {patient.phone && <span className="text-gray-900">{patient.phone}</span>}
                            </div>
                            <div>
                              <span className="font-medium">Last Visit:</span><br />
                              <span className="text-gray-900">{patient.lastVisitText}</span>
                            </div>
                            <div>
                              <span className="font-medium">Symptoms:</span><br />
                              <span className="text-gray-900">{patient.lastSymptoms}</span>
                            </div>
                            <div>
                              <span className="font-medium">Total Visits:</span><br />
                              <span className="text-gray-900">{patient.appointmentCount} visits</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 no-print">
                        <button 
                          onClick={() => handleViewDetails(patient)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 no-print">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} 
                  {' '}of {pagination.total} patients
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

      {/* Patient Details Modal */}
      {showDetailModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                <p className="text-gray-600">Complete patient information and medical history</p>
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
                {/* Left Column - Patient Info */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Patient Information
                    </h3>
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {selectedPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h4>
                        <div className="flex space-x-2 mt-1">
                          {(() => {
                            const priority = getPriorityLevel(selectedPatient.appointmentCount, selectedPatient.lastVisit);
                            return (
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${priority.color}`}>
                                {priority.level}
                              </span>
                            );
                          })()}
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getConditionColor(selectedPatient.lastDiagnosis)}`}>
                            {selectedPatient.lastDiagnosis}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPatient.dateOfBirth && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Age</p>
                          <p className="text-gray-900">{calculateAge(selectedPatient.dateOfBirth)} years old</p>
                          <p className="text-xs text-gray-500">Born: {formatDate(selectedPatient.dateOfBirth)}</p>
                        </div>
                      )}
                      
                      {selectedPatient.gender && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Gender</p>
                          <p className="text-gray-900">{selectedPatient.gender}</p>
                        </div>
                      )}
                      
                      {selectedPatient.bloodType && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Blood Type</p>
                          <p className="text-gray-900">{selectedPatient.bloodType}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Visits</p>
                        <p className="text-gray-900">{selectedPatient.appointmentCount} appointments</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <PhoneIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Contact Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-gray-900">{selectedPatient.email}</p>
                        </div>
                      </div>
                      
                      {selectedPatient.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Phone</p>
                            <p className="text-gray-900">{selectedPatient.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedPatient.address && (
                        <div className="flex items-start">
                          <UserIcon className="h-5 w-5 text-purple-600 mr-3 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Address</p>
                            <p className="text-gray-900">{selectedPatient.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {selectedPatient.emergencyContact && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Name</p>
                          <p className="text-gray-900">{selectedPatient.emergencyContact.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Phone</p>
                          <p className="text-gray-900">{selectedPatient.emergencyContact.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Relationship</p>
                          <p className="text-gray-900">{selectedPatient.emergencyContact.relationship}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Medical Info */}
                <div className="space-y-6">
                  {/* Last Visit Information */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Last Visit
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date</p>
                        <p className="text-gray-900">{selectedPatient.lastVisitText}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Symptoms</p>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                          <p className="text-red-800">{selectedPatient.lastSymptoms}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="text-blue-800">{selectedPatient.lastDiagnosis}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-purple-600" />
                        Medical History
                      </h3>
                      <div className="space-y-2">
                        {selectedPatient.medicalHistory.map((condition, index) => (
                          <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            <p className="text-yellow-800">{condition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Medications */}
                  {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h3>
                      <div className="space-y-2">
                        {selectedPatient.currentMedications.map((medication, index) => (
                          <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <p className="text-green-800">{medication}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {selectedPatient.allergies && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h3>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-red-800 font-medium">⚠️ {selectedPatient.allergies}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Edit Patient
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </button>
              </div>
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