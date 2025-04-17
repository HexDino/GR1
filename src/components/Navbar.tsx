"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AuthModal } from './AuthModal';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const pathname = usePathname();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mobile menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Departments dropdown toggle
  const toggleDepartments = () => {
    setIsDepartmentsOpen(!isDepartmentsOpen);
  };

  // Departments list for dropdown
  const departments = [
    { name: 'Cardiology', href: '/departments/cardiology' },
    { name: 'Neurology', href: '/departments/neurology' },
    { name: 'Pediatrics', href: '/departments/pediatrics' },
    { name: 'Orthopedics', href: '/departments/orthopedics' },
    { name: 'Dermatology', href: '/departments/dermatology' },
    { name: 'Gastroenterology', href: '/departments/gastroenterology' },
    { name: 'Ophthalmology', href: '/departments/ophthalmology' },
    { name: 'Gynecology', href: '/departments/gynecology' }
  ];

  // Navigation links (excluding Departments which will be handled separately)
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Check if the link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Check if any department route is active
  const isDepartmentActive = () => {
    return pathname.startsWith('/departments');
  };

  const openSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white shadow py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-purple-600">MedCare</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {/* Home link */}
            <Link
              href="/"
              className={`text-sm font-medium transition duration-300 ${
                isActive('/')
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Home
            </Link>

            {/* Departments dropdown */}
            <div className="relative">
              <button
                onClick={toggleDepartments}
                className={`text-sm font-medium transition duration-300 flex items-center ${
                  isDepartmentActive()
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                Departments
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 transition-transform ${isDepartmentsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDepartmentsOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  {departments.map((department) => (
                    <Link
                      key={department.name}
                      href={department.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      {department.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other nav links */}
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition duration-300 ${
                  isActive(link.href)
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={openSignIn} className="text-sm font-medium text-gray-700 hover:text-purple-600 transition duration-300">
              Log In
            </button>
            <button
              onClick={openSignUp}
              className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition duration-300"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              {/* Home link */}
              <Link
                href="/"
                className={`px-2 py-1 text-base font-medium rounded ${
                  isActive('/')
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              {/* Departments dropdown for mobile */}
              <div>
                <button
                  onClick={toggleDepartments}
                  className={`w-full text-left px-2 py-1 text-base font-medium rounded flex items-center justify-between ${
                    isDepartmentActive()
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  Departments
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${isDepartmentsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDepartmentsOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    {departments.map((department) => (
                      <Link
                        key={department.name}
                        href={department.href}
                        className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        onClick={() => setIsOpen(false)}
                      >
                        {department.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Other nav links */}
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2 py-1 text-base font-medium rounded ${
                    isActive(link.href)
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <hr className="my-2 border-gray-200" />
              <div className="flex flex-col space-y-3">
                <Link
                  href="/login"
                  className="px-2 py-1 text-base font-medium text-gray-700 hover:text-purple-600"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-purple-600 text-white px-4 py-2 rounded-full text-base font-medium hover:bg-purple-700 transition duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
}; 