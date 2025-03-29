'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaFilter, FaSearch } from 'react-icons/fa';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  experience: number;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [specialty, setSpecialty] = useState('');
  const [name, setName] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  
  const pageSize = 8;
  
  useEffect(() => {
    fetchDoctors();
  }, [currentPage, specialty, name, isAvailable]);
  
  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('skip', ((currentPage - 1) * pageSize).toString());
      params.append('take', pageSize.toString());
      
      if (specialty) {
        params.append('specialty', specialty);
      }
      
      if (name) {
        params.append('name', name);
      }
      
      if (isAvailable !== null) {
        params.append('isAvailable', isAvailable.toString());
      }
      
      const response = await fetch(`/api/doctors?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      const data = await response.json();
      setDoctors(data.doctors);
      setTotalPages(data.pagination.totalPages);
      setTotalDoctors(data.pagination.total);
      
      // Extract unique specialties
      const allSpecialties = new Set<string>();
      data.doctors.forEach((doctor: Doctor) => {
        if (doctor.specialty) {
          allSpecialties.add(doctor.specialty);
        }
      });
      setSpecialties(Array.from(allSpecialties));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDoctors();
  };
  
  const clearFilters = () => {
    setSpecialty('');
    setName('');
    setIsAvailable(null);
    setCurrentPage(1);
  };
  
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Our Doctors</h1>
          <p className="mt-2 text-gray-600">Find the right healthcare professional for your needs</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Search by name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C27FF]/50 focus:border-[#6C27FF]"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty
                </label>
                <select
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C27FF]/50 focus:border-[#6C27FF]"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select
                  id="availability"
                  value={isAvailable === null ? '' : isAvailable.toString()}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setIsAvailable(null);
                    } else {
                      setIsAvailable(e.target.value === 'true');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C27FF]/50 focus:border-[#6C27FF]"
                >
                  <option value="">All</option>
                  <option value="true">Available Now</option>
                  <option value="false">Not Available</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#6C27FF] text-white rounded-md hover:bg-[#5620CC] flex items-center"
              >
                <FaFilter className="mr-2" />
                Apply Filters
              </button>
            </div>
          </form>
        </div>
        
        {/* Doctor Listing */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C27FF]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div 
                    key={doctor.id} 
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-500 group hover:-translate-y-2 hover:border-[#6C27FF]/20 hover:border"
                  >
                    <div className="relative">
                      {doctor.isAvailable && (
                        <div className="absolute top-3 left-3 z-10 bg-white py-0.5 px-2 rounded-full text-xs text-[#6C27FF] font-medium flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6C27FF] mr-1"></span>
                          Available
                        </div>
                      )}
                      <div className="bg-[#6C27FF] w-full aspect-square overflow-hidden">
                        <Image 
                          src={doctor.imageUrl || "/doctors/placeholder.jpg"}
                          alt={doctor.name} 
                          width={300}
                          height={300}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-[#6C27FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#6C27FF] transition-all duration-300">{doctor.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">{doctor.specialty}</p>
                      <div className="flex justify-center items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`text-sm mx-0.5 group-hover:animate-pulse ${
                              i < Math.floor(doctor.rating) 
                                ? "text-[#6C27FF]" 
                                : "text-gray-300"
                            }`} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({doctor.reviewCount || 0})</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-3">
                        <div>Experience: {doctor.experience || 0} yrs</div>
                        <div>Fee: ${doctor.consultationFee || 0}</div>
                      </div>
                      <Link 
                        href={`/doctors/${doctor.id}`}
                        className="w-full py-2 border border-[#6C27FF] text-[#6C27FF] rounded-lg text-sm font-medium relative overflow-hidden group-hover:text-white transition-colors duration-300 block"
                      >
                        <span className="relative z-10">View Profile</span>
                        <div className="absolute inset-0 bg-[#6C27FF] -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-12 text-gray-500">
                  No doctors found matching your criteria. Please try different filters.
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-[#6C27FF] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
            
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {doctors.length} of {totalDoctors} doctors
            </div>
          </>
        )}
      </div>
    </main>
  );
} 