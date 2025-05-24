"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  lastVisit: string | null;
  lastVisitText: string;
  lastDiagnosis: string;
  lastSymptoms: string;
  appointmentCount: number;
  lastStatus: string | null;
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
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    loadPatients();
  }, [filters, pagination.offset]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      const response = await fetch(`/api/doctor/patients?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
        setPagination(data.pagination || pagination);
        setSummary(data.summary || summary);
      } else {
        throw new Error('Failed to load patients');
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof PatientFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * pagination.limit;
    setPagination(prev => ({ ...prev, offset: newOffset, page: newPage }));
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
    if (normalizedCondition.includes('asthma')) {
      return 'bg-green-100 text-green-800 border-green-200';
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Error Loading Patients</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadPatients();
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                My Patients
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and view your patients
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/doctor"
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </Link>
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Add New Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{summary.total}</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.activePatients}</div>
            <div className="text-sm text-gray-600">Active Patients</div>
            <div className="text-xs text-gray-500 mt-1">(visited in last 30 days)</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.newPatients}</div>
            <div className="text-sm text-gray-600">New Patients</div>
            <div className="text-xs text-gray-500 mt-1">(first-time visits)</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
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
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white">
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
                  <div key={patient.id} className="p-6 hover:bg-purple-25 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Patient Avatar */}
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
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
                      <div className="flex flex-col space-y-2">
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                          View Details
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
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
    </div>
  );
} 