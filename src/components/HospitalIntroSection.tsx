"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export const HospitalIntroSection = () => {
  return (
    <>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left side - Image */}
            <div className="lg:w-1/2">
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="/healthcare/hospital-building-new.jpg"
                  alt="Modern Hospital Building"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Welcome to Our Modern Healthcare Facility
              </h2>
              <div className="space-y-6">
                <p className="text-gray-600">
                  Founded in 1995, our hospital has been at the forefront of medical excellence 
                  for over 25 years. We combine state-of-the-art technology with compassionate 
                  care to provide the best possible health outcomes for our patients.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-purple-900 mb-2">25+</h3>
                    <p className="text-purple-700">Years of Excellence</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-purple-900 mb-2">100+</h3>
                    <p className="text-purple-700">Specialized Doctors</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-purple-900 mb-2">50k+</h3>
                    <p className="text-purple-700">Patients Served</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-purple-900 mb-2">24/7</h3>
                    <p className="text-purple-700">Emergency Care</p>
                  </div>
                </div>

                <p className="text-gray-600">
                  Our facility is equipped with cutting-edge medical technology and staffed by highly 
                  skilled healthcare professionals who are committed to providing exceptional patient care. 
                  We offer a comprehensive range of medical services, from routine check-ups to complex 
                  surgical procedures.
                </p>

                <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Learn More About Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Hospital Logo and Description */}
            <div className="space-y-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">
                  <span className="text-purple-600">Hospital</span>
                  <span className="text-gray-700">logo</span>
                </h2>
              </div>
              <p className="text-gray-600 text-sm">
                Providing quality healthcare services with modern facilities and experienced professionals. Your health is our top priority.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaMapMarkerAlt className="text-purple-600" />
                  <span>123 Healthcare Street, Medical District, City</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaPhone className="text-purple-600" />
                  <span>+1 (234) 567-8900</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaEnvelope className="text-purple-600" />
                  <span>contact@hospital.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-600 hover:text-purple-600">About Us</Link></li>
                <li><Link href="/doctors" className="text-gray-600 hover:text-purple-600">Our Doctors</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-purple-600">Our Services</Link></li>
                <li><Link href="/appointments" className="text-gray-600 hover:text-purple-600">Book Appointment</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-purple-600">Contact Us</Link></li>
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-6">Our Services</h3>
              <ul className="space-y-3">
                <li><Link href="/services/emergency" className="text-gray-600 hover:text-purple-600">Emergency Care</Link></li>
                <li><Link href="/services/cardiology" className="text-gray-600 hover:text-purple-600">Cardiology</Link></li>
                <li><Link href="/services/neurology" className="text-gray-600 hover:text-purple-600">Neurology</Link></li>
                <li><Link href="/services/pediatrics" className="text-gray-600 hover:text-purple-600">Pediatrics</Link></li>
                <li><Link href="/services/dental" className="text-gray-600 hover:text-purple-600">Dental Care</Link></li>
              </ul>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-6">Working Hours</h3>
              <ul className="space-y-3">
                <li className="flex justify-between text-gray-600">
                  <span>Monday - Friday:</span>
                  <span>8:00 AM - 8:00 PM</span>
                </li>
                <li className="flex justify-between text-gray-600">
                  <span>Saturday:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between text-gray-600">
                  <span>Sunday:</span>
                  <span>9:00 AM - 4:00 PM</span>
                </li>
                <li className="text-purple-600 font-semibold mt-4">
                  Emergency: 24/7
                </li>
              </ul>

              <div className="mt-6">
                <h3 className="text-gray-900 font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    <FaFacebook size={24} />
                  </Link>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    <FaTwitter size={24} />
                  </Link>
                  <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                    <FaInstagram size={24} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-gray-200 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; {new Date().getFullYear()} Hospital Name. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}; 