"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { AuthenticatedOnly } from '@/components/PermissionGate';
import { 
  HomeIcon, 
  UserIcon, 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  UsersIcon,
  BuildingOffice2Icon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

// Sidebar links based on user role
type SidebarLink = {
  href: string;
  label: string;
  icon: ReactNode;
  requiredRole?: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  requiredPermission?: {
    resource: string;
    action: string;
    scope?: string;
  };
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, hasPermission, isLoading } = usePermissions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Define sidebar links with icons
  const sidebarLinks: SidebarLink[] = [
    // Common links for all users
    { href: '/dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
    { href: '/dashboard/profile', label: 'My Profile', icon: <UserIcon className="w-5 h-5" /> },
    
    // Patient-specific links
    { 
      href: '/dashboard/appointments', 
      label: 'My Appointments', 
      icon: <CalendarIcon className="w-5 h-5" />,
      requiredRole: 'PATIENT'
    },
    { 
      href: '/dashboard/medical-records', 
      label: 'Medical Records', 
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      requiredRole: 'PATIENT'
    },
    
    // Doctor-specific links
    { 
      href: '/dashboard/doctor/appointments', 
      label: 'Appointment Schedule', 
      icon: <CalendarIcon className="w-5 h-5" />,
      requiredRole: 'DOCTOR'
    },
    { 
      href: '/dashboard/doctor/patients', 
      label: 'My Patients', 
      icon: <UsersIcon className="w-5 h-5" />,
      requiredRole: 'DOCTOR'
    },
    { 
      href: '/dashboard/doctor/reviews', 
      label: 'My Reviews', 
      icon: <UserCircleIcon className="w-5 h-5" />,
      requiredRole: 'DOCTOR'
    },
    
    // Admin-specific links
    { 
      href: '/dashboard/admin/users', 
      label: 'User Management', 
      icon: <UsersIcon className="w-5 h-5" />,
      requiredRole: 'ADMIN'
    },
    { 
      href: '/dashboard/admin/departments', 
      label: 'Departments', 
      icon: <BuildingOffice2Icon className="w-5 h-5" />,
      requiredRole: 'ADMIN'
    },
    { 
      href: '/dashboard/admin/doctors', 
      label: 'Doctors', 
      icon: <UserIcon className="w-5 h-5" />,
      requiredRole: 'ADMIN'
    },
    { 
      href: '/dashboard/admin/settings', 
      label: 'System Settings', 
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      requiredRole: 'ADMIN'
    },
  ];
  
  // Filter links based on user role and permissions
  const filteredLinks = sidebarLinks.filter(link => {
    if (!user || isLoading) return false;
    
    // Check role-based access
    if (link.requiredRole && user.role !== link.requiredRole) {
      return false;
    }
    
    // Check permission-based access
    if (link.requiredPermission) {
      const { resource, action, scope } = link.requiredPermission;
      if (!hasPermission(resource, action, scope)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implement dark mode logic here
    document.documentElement.classList.toggle('dark');
  };
  
  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  return (
    <AuthenticatedOnly redirectTo="/login">
      <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 bg-white shadow-lg">
              {/* Logo */}
              <div className="flex items-center h-16 px-6 border-b">
                <Link href="/" className="text-xl font-bold text-purple-600">
                  MedCare
                </Link>
                
                {/* Dark mode toggle - Desktop */}
                <button 
                  className="p-1 ml-auto rounded-full text-gray-500 hover:bg-gray-100"
                  onClick={toggleDarkMode}
                >
                  {darkMode ? (
                    <SunIcon className="w-5 h-5" />
                  ) : (
                    <MoonIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* User info */}
              <div className="flex flex-col items-center px-4 py-5 border-b">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                  {!isLoading && user?.name ? (
                    <span className="text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <UserIcon className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-sm font-semibold mt-2">
                  {!isLoading && user ? user.name : 'Loading...'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {!isLoading && user ? user.role : ''}
                </p>
              </div>
              
              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                  {filteredLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          pathname === link.href
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
                        }`}
                      >
                        <span className="mr-3 text-gray-500">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              {/* Logout */}
              <div className="p-4 border-t">
                <button
                  className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600"
                  onClick={() => {
                    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                      window.location.href = '/login';
                    });
                  }}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Navigation - Mobile */}
            <header className="bg-white shadow-sm md:hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    className="text-gray-600 focus:outline-none"
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
                  <Link href="/" className="ml-2 text-lg font-bold text-purple-600">
                    MedCare
                  </Link>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                    <BellIcon className="w-6 h-6" />
                  </button>
                  <button 
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                    onClick={toggleDarkMode}
                  >
                    {darkMode ? (
                      <SunIcon className="w-6 h-6" />
                    ) : (
                      <MoonIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </header>
            
            {/* Mobile Sidebar - Slide out menu */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-40 md:hidden">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="fixed inset-y-0 left-0 w-64 bg-white overflow-y-auto z-50">
                  {/* Mobile Menu Content */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <Link href="/" className="text-lg font-bold text-purple-600">
                        MedCare
                      </Link>
                      <button 
                        className="text-gray-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* User info */}
                  <div className="flex flex-col items-center px-4 py-5 border-b">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                      {!isLoading && user?.name ? (
                        <span className="text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                      ) : (
                        <UserIcon className="w-8 h-8" />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold mt-2">
                      {!isLoading && user ? user.name : 'Loading...'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {!isLoading && user ? user.role : ''}
                    </p>
                  </div>
                  
                  {/* Mobile Navigation Links */}
                  <nav className="p-4">
                    <ul className="space-y-1">
                      {filteredLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                              pathname === link.href
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="mr-3 text-gray-500">{link.icon}</span>
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Mobile Logout */}
                    <div className="mt-4 pt-4 border-t">
                      <button
                        className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600"
                        onClick={() => {
                          fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                            window.location.href = '/login';
                          });
                        }}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </nav>
                </div>
              </div>
            )}
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className="container mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </AuthenticatedOnly>
  );
} 