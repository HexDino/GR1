import React from 'react';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">About Our Hospital</h1>
          <p className="text-indigo-200 text-center mt-4 max-w-2xl mx-auto">
            We&apos;re dedicated to providing exceptional healthcare with compassion and expertise. Learn more about our mission, values, and the dedicated professionals behind our services.
          </p>
        </div>
      </div>
      
      {/* Our Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                <Image 
                  src="/images/hospital-building.jpg" 
                  alt="Hospital Building" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                Our mission is to improve the health and wellbeing of the communities we serve by delivering high-quality, compassionate care and providing exceptional patient experiences.
              </p>
              <p className="text-gray-600 mb-4">
                We strive to be the healthcare provider of choice, known for our excellence in medical care, our commitment to innovation, and our dedication to the highest standards of patient safety.
              </p>
              <p className="text-gray-600">
                Our team of experienced doctors, nurses, and healthcare professionals work together to ensure that every patient receives the best possible care in a supportive and healing environment.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Compassion</h3>
              <p className="text-gray-600">
                We treat each patient with kindness and empathy, recognizing their individual needs and concerns.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from medical care to patient service and facilities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-indigo-600 mb-4">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.022-.687-.065-1.022A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Integrity</h3>
              <p className="text-gray-600">
                We conduct ourselves with honesty, transparency, and ethical behavior in all interactions.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our History */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Our History</h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">
                Founded in 1985, our hospital began as a small community clinic with just five doctors and ten nurses. Over the decades, we&apos;ve grown into a comprehensive medical center serving thousands of patients annually.
              </p>
              <p className="text-gray-600 mb-4">
                In 2005, we expanded our facilities to include specialized departments for cardiology, oncology, pediatrics, and neurology. Our commitment to technological advancement has led to the acquisition of state-of-the-art medical equipment and the implementation of innovative treatments.
              </p>
              <p className="text-gray-600">
                Today, we&apos;re proud to be recognized as one of the leading healthcare providers in the region, with a team of over 200 medical professionals dedicated to improving the health and wellbeing of our community.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600 mb-2">200+</div>
                <div className="text-gray-700">Medical Professionals</div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600 mb-2">50,000+</div>
                <div className="text-gray-700">Patients Served Annually</div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600 mb-2">20+</div>
                <div className="text-gray-700">Specialized Departments</div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600 mb-2">35+</div>
                <div className="text-gray-700">Years of Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 