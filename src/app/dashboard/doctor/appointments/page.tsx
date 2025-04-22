"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

interface Appointment {
  id: string;
  patientName: string;
  patientImage: string;
  disease: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export default function AppointmentRequests() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patientName: 'Shyam Khanna',
      patientImage: '/doctors/doctor-1.jpg',
      disease: 'Heart Disease',
      date: '01/27/2023',
      time: '10:00 AM',
      status: 'pending'
    },
    {
      id: '2',
      patientName: 'Jean Lee Un',
      patientImage: '/doctors/doctor-2.jpg',
      disease: 'Heart Disease',
      date: '01/27/2023',
      time: '11:30 AM',
      status: 'pending'
    },
    {
      id: '3',
      patientName: 'Clara Brook',
      patientImage: '/doctors/doctor-3.jpg',
      disease: 'Heart Disease',
      date: '01/27/2023',
      time: '2:15 PM',
      status: 'pending'
    },
    {
      id: '4',
      patientName: 'James Cleveland',
      patientImage: '/doctors/doctor-2.jpg',
      disease: 'Diabetes',
      date: '01/28/2023',
      time: '9:30 AM',
      status: 'approved'
    },
    {
      id: '5',
      patientName: 'Tyler Johnson',
      patientImage: '/doctors/doctor-3.jpg',
      disease: 'Asthma',
      date: '01/29/2023',
      time: '3:45 PM',
      status: 'rejected'
    },
    {
      id: '6',
      patientName: 'Linda Martinez',
      patientImage: '/doctors/doctor-1.jpg',
      disease: 'Migraine',
      date: '01/30/2023',
      time: '10:00 AM',
      status: 'pending'
    },
  ]);
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  const handleApprove = (id: string) => {
    setAppointments(prev => 
      prev.map(app => app.id === id ? { ...app, status: 'approved' } : app)
    );
  };
  
  const handleReject = (id: string) => {
    setAppointments(prev => 
      prev.map(app => app.id === id ? { ...app, status: 'rejected' } : app)
    );
  };
  
  // Filtered appointments based on status
  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Appointment Requests</h1>
        <p className="text-gray-600">Manage your appointment requests and schedule</p>
      </div>
      
      {/* Filter tabs */}
      <div className="flex border-b mb-6">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          className={`px-4 py-2 text-sm font-medium ${filter === 'pending' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setFilter('approved')} 
          className={`px-4 py-2 text-sm font-medium ${filter === 'approved' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'}`}
        >
          Approved
        </button>
        <button 
          onClick={() => setFilter('rejected')} 
          className={`px-4 py-2 text-sm font-medium ${filter === 'rejected' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'}`}
        >
          Rejected
        </button>
      </div>
      
      {/* Appointments table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disease
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <Image
                          src={appointment.patientImage}
                          alt={appointment.patientName}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.disease}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(appointment.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircleIcon className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => handleReject(appointment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircleIcon className="h-6 w-6" />
                          </button>
                        </>
                      )}
                      <button className="text-purple-600 hover:text-purple-900">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No appointments found for this filter.
          </div>
        )}
      </div>
    </div>
  );
} 