"use client"

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
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
  
  // Login form state
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  // Register form state
  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse(loginFormData);
      // Handle successful login here
      console.log('Login successful', loginFormData);
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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      registerSchema.parse(registerFormData);
      // Handle successful registration here
      console.log('Registration successful', registerFormData);
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
    const { name, value } = e.target;
    setRegisterFormData(prev => ({ ...prev, [name]: value }));
  };

  const getErrorForField = (fieldName: string) => {
    return errors.find(error => error.path === fieldName)?.message;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 md:mx-auto">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
            </h3>
          </div>
          
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`flex-1 py-2 text-center ${mode === 'signin' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500 hover:text-purple-600'}`}
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-center ${mode === 'signup' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500 hover:text-purple-600'}`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>
          
          {mode === 'signin' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
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
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginFormData.password}
                  onChange={handleLoginChange}
                  className={`w-full px-3 py-2 border ${getErrorForField('password') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="Enter your password"
                />
                {getErrorForField('password') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorForField('password')}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={registerFormData.name}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 py-2 border ${getErrorForField('name') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="Enter your full name"
                />
                {getErrorForField('name') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorForField('name')}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  value={registerFormData.email}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 py-2 border ${getErrorForField('email') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="Enter your email"
                />
                {getErrorForField('email') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorForField('email')}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  value={registerFormData.password}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 py-2 border ${getErrorForField('password') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="Enter your password"
                />
                {getErrorForField('password') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorForField('password')}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={registerFormData.confirmPassword}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 py-2 border ${getErrorForField('confirmPassword') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="Confirm your password"
                />
                {getErrorForField('confirmPassword') && (
                  <p className="mt-1 text-sm text-red-600">{getErrorForField('confirmPassword')}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Sign up
              </button>
            </form>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              
              <div>
                <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 