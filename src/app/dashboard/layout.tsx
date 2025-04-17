"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { AuthenticatedOnly } from '@/components/PermissionGate';

// Sidebar links based on user role
type SidebarLink = {
  href: string;
  label: string;
  icon?: ReactNode;
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
  
  // Define sidebar links
  const sidebarLinks: SidebarLink[] = [
    // Common links for all users
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/profile', label: 'My Profile', icon: '👤' },
    
    // Patient-specific links
    { 
      href: '/dashboard/appointments', 
      label: 'My Appointments', 
      icon: '📅',
      requiredRole: 'PATIENT'
    },
    { 
      href: '/dashboard/medical-records', 
      label: 'Medical Records', 
      icon: '📋',
      requiredRole: 'PATIENT'
    },
    
    // Doctor-specific links
    { 
      href: '/dashboard/doctor/appointments', 
      label: 'Appointment Schedule', 
      icon: '🗓️',
      requiredRole: 'DOCTOR'
    },
    { 
      href: '/dashboard/doctor/patients', 
      label: 'My Patients', 
      icon: '👥',
      requiredRole: 'DOCTOR'
    },
    { 
      href: '/dashboard/doctor/reviews', 
      label: 'My Reviews', 
      icon: '⭐',
      requiredRole: 'DOCTOR'
    },
    
    // Admin-specific links
    { 
      href: '/dashboard/admin/users', 
      label: 'User Management', 
      icon: '👥',
      requiredRole: 'ADMIN'
    },
    { 
      href: '/dashboard/admin/departments', 
      label: 'Departments', 
      icon: '🏥',
      requiredRole: 'ADMIN'
    },
    { 
      href: '/dashboard/admin/doctors', 
      label: 'Doctors', 
      icon: '👨‍⚕️',
      requiredRole: 'ADMIN'
    },
    { 
      href: '/dashboard/admin/settings', 
      label: 'System Settings', 
      icon: '⚙️',
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
  
  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  return (
    <AuthenticatedOnly redirectTo="/login">
      <div className="min-h-screen bg-gray-100">
        {/* Dashboard Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-purple-600">
                Hospital
              </Link>
              
              <div className="hidden md:flex ml-8 space-x-2">
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-purple-600">
                  Dashboard
                </Link>
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-purple-600">
                  Back to Website
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-700"
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
            
            {/* User menu */}
            <div className="hidden md:flex items-center ml-6">
              <div className="flex items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="text-gray-700 mr-2">{user?.name}</span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className={`md:w-64 flex-shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
              <nav className="bg-white shadow-sm rounded-lg p-6">
                <ul className="space-y-2">
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
                        {link.icon && <span className="mr-3">{link.icon}</span>}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                  
                  {/* Logout */}
                  <li className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600"
                      onClick={() => {
                        fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                          window.location.href = '/login';
                        });
                      }}
                    >
                      <span className="mr-3">🚪</span>
                      <span>Log Out</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 bg-white shadow-sm rounded-lg p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthenticatedOnly>
  );
} 