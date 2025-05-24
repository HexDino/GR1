"use client"

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';
import Image from 'next/image';
import PasswordInput from './ui/PasswordInput';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

type Error = {
  path: string;
  message: string;
};

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
};

export const AuthModal = ({ isOpen, onClose, initialMode }: AuthModalProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [errors, setErrors] = useState<Error[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Login form state
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  // Register form state
  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  // Reset errors when mode changes
  useEffect(() => {
    setErrors([]);
  }, [mode]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors([]);
      setLoginFormData({
        email: '',
        password: '',
      });
      setRegisterFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      });
    }
  }, [isOpen, initialMode]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Validating login form data');
      loginSchema.parse(loginFormData);
      
      // Gọi API đăng nhập
      console.log('Submitting login request to API', { email: loginFormData.email });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginFormData.email,
          password: loginFormData.password,
          remember: true, // Lưu phiên đăng nhập
        }),
        credentials: 'include', // Đảm bảo cookie được gửi và nhận
      });

      console.log('Login API response status:', response.status);
      const data = await response.json();
      console.log('Login API response:', data);
      
      if (data.success) {
        console.log('Login successful, redirecting based on role:', data.data.user.role);
        
        // Đóng modal
        onClose();
        
        // Đảm bảo cookie được thiết lập trước khi chuyển hướng
        setTimeout(() => {
          // Chuyển hướng dựa theo role
          const userRole = data.data.user.role.toLowerCase();
          const dashboardUrl = `/dashboard/${userRole}`;
          console.log('Redirecting to dashboard:', dashboardUrl);
          
          // Thực hiện chuyển hướng
          window.location.href = dashboardUrl;
        }, 1000);
      } else {
        // Hiển thị lỗi từ server
        console.error('Login failed:', data.message);
        setErrors([{
          path: 'server',
          message: data.message || 'Login failed. Please try again.',
        }]);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        setErrors(error.errors.map(err => ({
          path: err.path[0].toString(),
          message: err.message,
        })));
      } else {
        // Lỗi không xác định
        console.error('Login error:', error);
        setErrors([{
          path: 'server',
          message: 'An unexpected error occurred. Please try again.',
        }]);
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      registerSchema.parse(registerFormData);
      // Combine first and last name for the DB
      const userData = {
        name: `${registerFormData.firstName} ${registerFormData.lastName}`,
        email: registerFormData.email,
        password: registerFormData.password,
      };
      // Handle successful registration here
      console.log('Registration successful', userData);
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors.map(err => ({
          path: err.path[0].toString(),
          message: err.message,
        })));
      }
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegisterFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const getErrorForField = (fieldName: string) => {
    return errors.find(error => error.path === fieldName)?.message;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 md:mx-auto overflow-hidden flex"
      >
        {/* Left side - Image */}
        <div className="hidden md:block w-5/12 relative">
          <div className="h-full">
            <Image 
              src="/healthcare/hospital-building-new.jpg" 
              alt="Hospital Building" 
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="w-full md:w-7/12 p-6 md:p-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          {mode === 'signin' ? (
            <>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Sign in to your account
                </h3>
              </div>
            
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginFormData.email}
                    onChange={handleLoginChange}
                    className={`w-full px-3 py-2 border ${getErrorForField('email') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Enter your email"
                  />
                  {getErrorForField('email') && (
                    <p className="mt-1 text-sm text-red-600">{getErrorForField('email')}</p>
                  )}
                </div>
                
                <PasswordInput
                  id="password"
                  name="password"
                  value={loginFormData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  label="Password"
                  error={getErrorForField('password')}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  autoComplete="current-password"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Sign in
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('signup')} 
                      className="font-medium text-purple-600 hover:text-purple-500"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Sign up for account
                </h3>
              </div>
            
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={registerFormData.firstName}
                      onChange={handleRegisterChange}
                      className={`w-full px-3 py-2 border ${getErrorForField('firstName') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                      placeholder="Your First Name"
                    />
                    {getErrorForField('firstName') && (
                      <p className="mt-1 text-sm text-red-600">{getErrorForField('firstName')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={registerFormData.lastName}
                      onChange={handleRegisterChange}
                      className={`w-full px-3 py-2 border ${getErrorForField('lastName') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                      placeholder="Your Last Name"
                    />
                    {getErrorForField('lastName') && (
                      <p className="mt-1 text-sm text-red-600">{getErrorForField('lastName')}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={registerFormData.email}
                    onChange={handleRegisterChange}
                    className={`w-full px-3 py-2 border ${getErrorForField('email') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="Enter Your email Address"
                  />
                  {getErrorForField('email') && (
                    <p className="mt-1 text-sm text-red-600">{getErrorForField('email')}</p>
                  )}
                </div>
                
                <PasswordInput
                  id="password"
                  name="password"
                  value={registerFormData.password}
                  onChange={handleRegisterChange}
                  placeholder="Your Password"
                  label="Password"
                  error={getErrorForField('password')}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  autoComplete="new-password"
                />
                
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={registerFormData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm Your Password"
                  label="Confirm Password"
                  error={getErrorForField('confirmPassword')}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  autoComplete="new-password"
                />
                
                <div className="flex items-center">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={registerFormData.acceptTerms}
                    onChange={handleRegisterChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                    I accept all <a href="#" className="text-purple-600 hover:underline">terms and condition</a>
                  </label>
                </div>
                {getErrorForField('acceptTerms') && (
                  <p className="text-sm text-red-600">{getErrorForField('acceptTerms')}</p>
                )}
                
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Sign Up
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setMode('signin')} 
                      className="font-medium text-purple-600 hover:text-purple-500"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 