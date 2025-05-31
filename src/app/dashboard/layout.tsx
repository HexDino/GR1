"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleLogout } from '@/lib/auth/logout';

// Simple sidebar links for doctors only
type SidebarLink = {
  href: string;
  label: string;
  icon: string;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sidebar links for doctors
  const doctorLinks: SidebarLink[] = [
    { href: '/dashboard/doctor', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/doctor/appointments', label: 'Appointments', icon: '📅' },
    { href: '/dashboard/doctor/patients', label: 'My Patients', icon: '👥' },
    { href: '/dashboard/doctor/prescriptions', label: 'Prescriptions', icon: '📋' },
    { href: '/dashboard/doctor/profile', label: 'My Profile', icon: '👤' },
  ];

  // Sidebar links for patients
  const patientLinks: SidebarLink[] = [
    { href: '/dashboard/patient/health-dashboard', label: 'Health Overview', icon: '❤️' },
    { href: '/dashboard/patient/appointments', label: 'Appointments', icon: '📅' },
    { href: '/dashboard/patient/prescriptions', label: 'Prescriptions', icon: '💊' },
    { href: '/dashboard/patient/medical-records', label: 'Medical Records', icon: '📋' },
    { href: '/dashboard/patient/health-goals', label: 'Health Goals', icon: '🎯' },
    { href: '/dashboard/patient/reviews', label: 'My Reviews', icon: '⭐' },
    { href: '/dashboard/patient/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/dashboard/patient/profile', label: 'My Profile', icon: '👤' },
  ];

  // Sidebar links for admins
  const adminLinks: SidebarLink[] = [
    { href: '/dashboard/admin/users', label: 'User Management', icon: '👥' },
    { href: '/dashboard/admin/doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { href: '/dashboard/admin/patients', label: 'Patients', icon: '🧑‍⚕️' },
    { href: '/dashboard/admin/medicine', label: 'Medicine', icon: '💊' },
  ];

  // Get current navigation links based on user role
  const getCurrentLinks = () => {
    if (user?.role === 'ADMIN') return adminLinks;
    if (user?.role === 'PATIENT') return patientLinks;
    return doctorLinks;
  };
  
  const currentLinks = getCurrentLinks();
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white shadow-lg border-r border-gray-200">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-800">
              <Link href="/" className="text-xl font-bold text-white">
                MedCare
              </Link>
            </div>
            
            {/* User Profile */}
            <div className="flex flex-col items-center px-6 py-6 border-b border-gray-100 bg-gray-50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center text-white mb-3">
                <span className="text-2xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{user?.name || (user?.role === 'PATIENT' ? 'Patient' : user?.role === 'ADMIN' ? 'Administrator' : 'Doctor')}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {user?.role === 'PATIENT' ? 'Patient' : user?.role === 'ADMIN' ? 'System Administrator' : 'Medical Professional'}
              </p>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-2">
                {currentLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                        pathname === link.href
                          ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                    >
                      <span className="text-xl mr-3">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
              <button
                className="w-full flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                onClick={handleLogout}
              >
                <span className="text-xl mr-3">🚪</span>
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile Header */}
          <header className="bg-white shadow-sm md:hidden border-b border-gray-200">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  className="text-gray-600 focus:outline-none p-2 rounded-lg hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    )}
                  </svg>
                </button>
                <Link href="/" className="ml-2 text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  MedCare
                </Link>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {user?.role === 'PATIENT' ? user?.name || 'Patient' : user?.role === 'ADMIN' ? 'Administrator' : `Dr. ${user?.name || 'Doctor'}`}
              </div>
            </div>
          </header>
          
          {/* Mobile Sidebar */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="fixed inset-y-0 left-0 w-64 bg-white overflow-y-auto z-50 shadow-xl">
                {/* Mobile Logo */}
                <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-800">
                  <Link href="/" className="text-xl font-bold text-white">
                    MedCare
                  </Link>
                </div>
                
                {/* Mobile User info */}
                <div className="flex flex-col items-center px-6 py-6 border-b border-gray-100 bg-gray-50">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center text-white mb-3">
                    <span className="text-2xl font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{user?.name || (user?.role === 'PATIENT' ? 'Patient' : user?.role === 'ADMIN' ? 'Administrator' : 'Doctor')}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.role === 'PATIENT' ? 'Patient' : user?.role === 'ADMIN' ? 'System Administrator' : 'Medical Professional'}
                  </p>
                </div>
                
                {/* Mobile Navigation */}
                <nav className="p-4">
                  <ul className="space-y-2">
                    {currentLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                            pathname === link.href
                              ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg'
                              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="text-xl mr-3">{link.icon}</span>
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Mobile Logout */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      className="w-full flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      onClick={handleLogout}
                    >
                      <span className="text-xl mr-3">🚪</span>
                      <span className="font-medium">Log Out</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          )}
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 