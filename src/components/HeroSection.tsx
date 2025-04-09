"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const HeroSection = () => {
  return (
    <section className="relative py-16 md:pt-24 md:pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left Content */}
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-purple-600">We care</span>
              <br />
              <span className="text-gray-800">about your health</span>
            </h1>
            <p className="text-gray-600 mb-10 max-w-lg">
              Good health is the state of mental, physical and social well being
              and it does not just mean absence of diseases.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Link 
                href="/appointment"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-full inline-flex items-center transition duration-300"
              >
                Book an appointment
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              
              <button 
                className="bg-white hover:bg-gray-100 text-gray-800 font-medium px-6 py-3 rounded-full inline-flex items-center border border-gray-300 transition duration-300"
              >
                <span className="bg-purple-600 rounded-full p-1 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </span>
                Watch videos
              </button>
            </div>
            
            <div className="mt-10">
              <p className="text-gray-600">
                Become member of our hospital community?{' '}
                <Link href="/sign-up" className="text-purple-600 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
            
            {/* Doctor Search Form */}
            <div className="mt-10 py-5 px-6 bg-white rounded-2xl shadow-lg">
              <h3 className="text-gray-800 font-medium mb-5">Find a doctor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Name of Doctor"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Speciality"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center mr-4">
                    <span className="text-sm text-gray-700 mr-2">Availability</span>
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition duration-300">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Image */}
          <div className="lg:w-1/2 relative">
            {/* Main circular design with outer ring */}
            <div className="relative w-[480px] h-[480px] mx-auto">
              {/* Outer gray ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-gray-100 opacity-70"></div>
              
              {/* Middle white ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[430px] h-[430px] rounded-full bg-white opacity-90"></div>
              
              {/* Inner purple circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-purple-600 overflow-hidden">
                {/* Bottom part of doctors image (legs) - clipped inside the purple circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px]">
                  <div className="w-full h-full relative">
                    <Image
                      src="/doctors.png"
                      alt="Doctors bottom part"
                      width={420} 
                      height={420}
                      className="object-contain transform scale-150 translate-y-[-40px]"
                      priority
                    />
                  </div>
                </div>
              </div>
                
              {/* Top part of doctors image - outside without clipping */}
              <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[250px] overflow-hidden z-30">
                <div className="w-full h-full relative">
                  <Image
                    src="/doctors_top_part.png"
                    alt="Doctors top part"
                    width={420} 
                    height={420}
                    className="object-contain transform scale-150 translate-y-[-60px]"
                    priority
                  />
                </div>
              </div>
            </div>
            
            {/* Doctor Info Boxes */}
            <div className="absolute top-20 left-16 bg-white py-3 px-4 rounded-xl shadow-md flex items-center z-20">
              <div className="bg-purple-100 p-2 rounded-full mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-800 font-medium text-sm">Well Qualified doctors</h4>
                <p className="text-gray-500 text-xs">Treat with care</p>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-0 bg-white py-3 px-4 rounded-xl shadow-md flex items-center z-20">
              <div className="bg-purple-100 p-2 rounded-full mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-800 font-medium text-sm">Book an appointment</h4>
                <p className="text-gray-500 text-xs">Online appointment</p>
              </div>
            </div>
            
            <div className="absolute top-1/2 right-20 bg-white bg-opacity-30 backdrop-filter backdrop-blur-sm py-3 px-4 rounded-xl shadow-md z-20 flex items-center border border-white border-opacity-30">
              <div className="text-black mr-2">
                <span className="font-medium text-sm">Contact no</span>
                <p className="font-medium">+971512387325</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            
            {/* Search button for mobile */}
            <div className="absolute -bottom-12 left-0 lg:hidden">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-medium transition duration-300">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 