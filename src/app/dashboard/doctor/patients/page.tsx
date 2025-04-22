"use client";

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { 
  UserIcon, 
  ClipboardDocumentListIcon,
  PaperAirplaneIcon,
  CalendarDaysIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import SearchBar from '@/components/SearchBar';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

interface PatientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  condition: string;
  lastVisit: string;
  nextAppointment: string | null;
}

export default function PatientsList() {
  const { user, isLoading } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientData[]>([]);
  
  // Use SWR for data fetching with searchQuery as a dependency
  const { data, error, isValidating } = useSWR(
    () => searchQuery ? `/api/doctor/patients/search?q=${encodeURIComponent(searchQuery)}` : '/api/doctor/patients/search',
    fetcher
  );
  
  // Update state when data changes
  useEffect(() => {
    if (data) {
      setPatients(data);
    }
  }, [data]);
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
          <p className="text-gray-500">Manage and view your patients</p>
        </div>
        
        <div className="flex space-x-2">
          <Link 
            href="/dashboard/doctor/patients/create" 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Add New Patient
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6 md:flex md:items-center md:justify-between gap-4">
          <SearchBar 
            placeholder="Search patients by name, email or phone..." 
            onSearch={handleSearch}
            className="w-full md:w-96"
          />
          
          <div className="mt-4 md:mt-0 flex items-center text-sm text-gray-500">
            {isValidating ? 'Searching...' : error ? 'Error loading patients' : `${patients.length} patients found`}
          </div>
        </div>
        
        {error ? (
          <div className="text-center py-8 text-red-500">
            Error loading patients data. Please try again later.
          </div>
        ) : isValidating && !data ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery 
              ? `No patients found matching "${searchQuery}". Try another search term.` 
              : "No patients found. Add your first patient using the button above."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Appointment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {patient.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastVisit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.nextAppointment || 'No upcoming appointments'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/doctor/patients/${patient.id}`} className="text-purple-600 hover:text-purple-900">
                          View
                        </Link>
                        <Link href={`/dashboard/doctor/patients/${patient.id}/appointments/new`} className="text-blue-600 hover:text-blue-900">
                          Schedule
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 