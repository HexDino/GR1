import React from 'react';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Contact Us</h1>
          <p className="text-indigo-200 text-center mt-4 max-w-2xl mx-auto">
            Have questions or need assistance? We&apos;re here to help. Reach out to our team through any of the channels below.
          </p>
        </div>
      </div>
      
      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Phone</h3>
              <p className="text-gray-600">Main: (123) 456-7890</p>
              <p className="text-gray-600">Emergency: (123) 456-7899</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">info@hospital.com</p>
              <p className="text-gray-600">appointments@hospital.com</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Address</h3>
              <p className="text-gray-600">123 Medical Center Blvd</p>
              <p className="text-gray-600">Cityville, State 12345</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map and Contact Form */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            {/* Map */}
            <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Find Us</h2>
              <div className="bg-gray-300 h-[400px] rounded-lg w-full">
                {/* This would be replaced with an actual map component */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600">Map integration would go here</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Hours of Operation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-700 font-medium">Monday - Friday</p>
                    <p className="text-gray-600">8:00 AM - 8:00 PM</p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Saturday</p>
                    <p className="text-gray-600">9:00 AM - 5:00 PM</p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Sunday</p>
                    <p className="text-gray-600">10:00 AM - 4:00 PM</p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Emergency Care</p>
                    <p className="text-gray-600">24/7</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:w-1/2">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
              <form className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="(123) 456-7890"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    id="subject" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="appointment">Appointment Inquiry</option>
                    <option value="billing">Billing Question</option>
                    <option value="general">General Information</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto divide-y divide-gray-200">
            <div className="py-5">
              <h3 className="text-lg font-medium text-gray-800">How do I schedule an appointment?</h3>
              <p className="mt-2 text-gray-600">
                You can schedule an appointment by calling our front desk at (123) 456-7890, using our online appointment system, or visiting our hospital during business hours.
              </p>
            </div>
            
            <div className="py-5">
              <h3 className="text-lg font-medium text-gray-800">What insurance plans do you accept?</h3>
              <p className="mt-2 text-gray-600">
                We accept most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, and UnitedHealthcare. Please contact our billing department for specific questions about your insurance coverage.
              </p>
            </div>
            
            <div className="py-5">
              <h3 className="text-lg font-medium text-gray-800">How can I access my medical records?</h3>
              <p className="mt-2 text-gray-600">
                You can access your medical records through our patient portal. If you haven&apos;t registered yet, please contact our medical records department at (123) 456-7895 for assistance.
              </p>
            </div>
            
            <div className="py-5">
              <h3 className="text-lg font-medium text-gray-800">What should I bring to my first appointment?</h3>
              <p className="mt-2 text-gray-600">
                Please bring your government-issued ID, insurance card, list of current medications, medical history information, and any recent test results or medical records from previous healthcare providers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 