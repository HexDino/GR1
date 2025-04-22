"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/departments', label: 'Departments' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function MainNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Không hiển thị navigation khi đang ở trang dashboard
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-purple-600">MedCare</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`font-medium ${pathname === link.href 
                  ? 'text-purple-600' 
                  : 'text-gray-700 hover:text-purple-600'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="font-medium text-gray-700 hover:text-purple-600">
              Sign in
            </Link>
            <Link href="/signup" className="font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full">
              Sign up
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg 
              className="w-6 h-6 text-gray-700" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              {navigationLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`font-medium ${pathname === link.href 
                    ? 'text-purple-600' 
                    : 'text-gray-700 hover:text-purple-600'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t flex flex-col space-y-4">
                <Link 
                  href="/login" 
                  className="font-medium text-gray-700 hover:text-purple-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link 
                  href="/signup" 
                  className="font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full inline-block text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 