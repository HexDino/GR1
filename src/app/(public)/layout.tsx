import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-semibold text-indigo-600">Hospital</h3>
              <p className="mt-2 text-gray-600 max-w-md">
                Providing quality healthcare services for you and your family.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Quick Links</h4>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/" className="text-gray-600 hover:text-indigo-600">Home</Link></li>
                  <li><Link href="/services" className="text-gray-600 hover:text-indigo-600">Services</Link></li>
                  <li><Link href="/doctors" className="text-gray-600 hover:text-indigo-600">Doctors</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Resources</h4>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/about-us" className="text-gray-600 hover:text-indigo-600">About Us</Link></li>
                  <li><Link href="/contact-us" className="text-gray-600 hover:text-indigo-600">Contact Us</Link></li>
                  <li><Link href="/faqs" className="text-gray-600 hover:text-indigo-600">FAQs</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Contact</h4>
                <ul className="mt-4 space-y-2">
                  <li className="text-gray-600">123 Medical Center Blvd</li>
                  <li className="text-gray-600">+1 (123) 456-7890</li>
                  <li className="text-gray-600">info@hospital.com</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-center">© {new Date().getFullYear()} Hospital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 