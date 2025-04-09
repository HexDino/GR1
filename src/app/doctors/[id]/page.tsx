"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Interface for Doctor data
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  bio?: string;
  education?: string[];
  experience?: string[];
  languages?: string[];
  schedule?: {
    day: string;
    hours: string;
  }[];
}

// Mock database of doctors
const doctorsData: Doctor[] = [
  {
    id: "dr-robert-henry",
    name: "Dr. Robert Henry",
    specialty: "Cardiologist",
    image: "/doctors/doctor1.jpg",
    rating: 4.5,
    reviewCount: 102,
    available: true,
    bio: "Dr. Robert Henry is a board-certified cardiologist with over 15 years of experience in treating various heart conditions. He specializes in preventive cardiology and heart failure management.",
    education: [
      "MD, Harvard Medical School",
      "Residency in Internal Medicine, Massachusetts General Hospital",
      "Fellowship in Cardiovascular Disease, Stanford University Medical Center"
    ],
    experience: [
      "Chief of Cardiology, Boston Medical Center (2018-Present)",
      "Associate Professor of Medicine, Harvard Medical School (2015-Present)",
      "Staff Cardiologist, Massachusetts General Hospital (2010-2018)"
    ],
    languages: ["English", "Spanish"],
    schedule: [
      { day: "Monday", hours: "9:00 AM - 5:00 PM" },
      { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
      { day: "Friday", hours: "9:00 AM - 3:00 PM" }
    ]
  },
  {
    id: "dr-harry-littleton",
    name: "Dr. Harry Littleton",
    specialty: "Neurologist",
    image: "/doctors/doctor2.jpg",
    rating: 4.5,
    reviewCount: 97,
    available: true,
    bio: "Dr. Harry Littleton is a renowned neurologist specializing in the diagnosis and treatment of neurological disorders. He has particular expertise in movement disorders and neurodegenerative diseases.",
    education: [
      "MD, Johns Hopkins University School of Medicine",
      "Residency in Neurology, Mayo Clinic",
      "Fellowship in Movement Disorders, UCLA Medical Center"
    ],
    experience: [
      "Director of Neurology Department, Cleveland Clinic (2020-Present)",
      "Associate Professor of Neurology, Johns Hopkins University (2016-2020)",
      "Attending Neurologist, Mayo Clinic (2012-2016)"
    ],
    languages: ["English", "French"],
    schedule: [
      { day: "Tuesday", hours: "8:00 AM - 4:00 PM" },
      { day: "Thursday", hours: "8:00 AM - 4:00 PM" },
      { day: "Saturday", hours: "9:00 AM - 1:00 PM" }
    ]
  },
  {
    id: "dr-sharina-khan",
    name: "Dr. Sharina Khan",
    specialty: "Gynologist",
    image: "/doctors/doctor3.jpg",
    rating: 4.5,
    reviewCount: 116,
    available: true,
    bio: "Dr. Sharina Khan is a highly skilled gynecologist with a focus on women's reproductive health. She provides comprehensive care for women across all stages of life.",
    education: [
      "MD, Yale School of Medicine",
      "Residency in Obstetrics and Gynecology, Brigham and Women's Hospital",
      "Fellowship in Reproductive Endocrinology, Columbia University Medical Center"
    ],
    experience: [
      "Head of Gynecology, New York-Presbyterian Hospital (2019-Present)",
      "Assistant Professor of Obstetrics and Gynecology, Yale University (2015-2019)",
      "Attending Physician, Brigham and Women's Hospital (2011-2015)"
    ],
    languages: ["English", "Urdu", "Hindi"],
    schedule: [
      { day: "Monday", hours: "10:00 AM - 6:00 PM" },
      { day: "Wednesday", hours: "10:00 AM - 6:00 PM" },
      { day: "Thursday", hours: "1:00 PM - 7:00 PM" }
    ]
  },
  {
    id: "dr-sanjeev-kapoor",
    name: "Dr. Sanjeev Kapoor",
    specialty: "Child Specialist",
    image: "/doctors/doctor4.jpg",
    rating: 4.5,
    reviewCount: 72,
    available: true,
    bio: "Dr. Sanjeev Kapoor is a dedicated pediatrician with extensive experience in child healthcare. He specializes in pediatric development and adolescent medicine.",
    education: [
      "MD, University of California, San Francisco",
      "Residency in Pediatrics, Children's Hospital of Philadelphia",
      "Fellowship in Adolescent Medicine, Boston Children's Hospital"
    ],
    experience: [
      "Chief Pediatrician, Children's Hospital Los Angeles (2017-Present)",
      "Associate Professor of Pediatrics, UCSF (2014-2017)",
      "Pediatric Consultant, UNICEF (2010-2014)"
    ],
    languages: ["English", "Hindi", "Punjabi"],
    schedule: [
      { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
      { day: "Thursday", hours: "9:00 AM - 5:00 PM" },
      { day: "Friday", hours: "10:00 AM - 4:00 PM" }
    ]
  }
];

// Function to render star rating
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg 
          key={i} 
          className={`h-4 w-4 ${i < Math.floor(rating) 
            ? 'text-purple-600 fill-purple-600' 
            : i < rating 
              ? 'text-purple-600 fill-purple-600' 
              : 'text-gray-300 fill-gray-300'}`}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
};

// Doctor detail section component
const DoctorDetail = ({ params }: { params: { id: string } }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from API
    const fetchDoctor = () => {
      setLoading(true);
      // Find doctor with matching ID from our mock data
      const foundDoctor = doctorsData.find(doc => doc.id === params.id);
      
      // Simulate API delay
      setTimeout(() => {
        setDoctor(foundDoctor || null);
        setLoading(false);
      }, 500);
    };

    fetchDoctor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Doctor Not Found</h1>
        <p className="text-gray-600 mb-6">We could not find the doctor you are looking for.</p>
        <Link 
          href="/doctors"
          className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition"
        >
          View All Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/doctors"
            className="inline-flex items-center text-purple-600 mb-8 hover:text-purple-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Doctors
          </Link>
          
          {/* Doctor info card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/3 bg-purple-600 p-6 flex items-center justify-center">
                <div className="w-48 h-48 relative overflow-hidden rounded-full border-4 border-white">
                  <Image 
                    src={doctor.image} 
                    alt={doctor.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </div>
              
              <div className="p-8 md:w-2/3">
                <div className="flex items-center mb-2">
                  {doctor.available && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Available
                    </span>
                  )}
                  <span className="text-gray-500 text-sm">{doctor.specialty}</span>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-4">{doctor.name}</h1>
                
                <div className="flex items-center mb-6">
                  <RatingStars rating={doctor.rating} />
                  <span className="text-gray-500 ml-2">({doctor.reviewCount} reviews)</span>
                </div>
                
                <p className="text-gray-600 mb-6">{doctor.bio}</p>
                
                <Link
                  href="#appointment-form"
                  className="bg-purple-600 text-white px-6 py-3 rounded-full font-medium hover:bg-purple-700 transition inline-flex items-center"
                >
                  Book an Appointment
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Doctor details accordion */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About {doctor.name}</h2>
              
              {/* Education */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Education</h3>
                <ul className="space-y-2">
                  {doctor.education?.map((edu, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-purple-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Experience */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Experience</h3>
                <ul className="space-y-2">
                  {doctor.experience?.map((exp, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-purple-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Languages */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages?.map((lang, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Schedule */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {doctor.schedule?.map((sch, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-800">{sch.day}</div>
                      <div className="text-sm text-gray-600">{sch.hours}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Appointment form */}
          <div id="appointment-form" className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Book an Appointment</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" 
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" 
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" 
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                    <input 
                      type="date" 
                      id="date" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" 
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" 
                    placeholder="Describe your health concern briefly"
                  ></textarea>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
                  >
                    Submit Appointment Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail; 