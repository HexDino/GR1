"use client"

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Signup Popup Component
export const SignupPopup = ({ 
  isOpen, 
  onClose,
  onSwitchToLogin
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSwitchToLogin?: () => void;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-4xl animate-fade-in">
        <div className="flex flex-col md:flex-row">
          <div className="bg-[#6C27FF] p-8 md:w-2/5 flex flex-col justify-center items-center text-white">
            <h2 className="text-2xl font-bold mb-2">Hospital logo</h2>
            <div className="my-8 flex justify-center">
              <div className="w-[300px] h-[250px] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-40 h-40">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:w-3/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Sign up For account</h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-gray-700 mb-2">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  placeholder="Your First Name" 
                  className="w-full px-4 py-3 rounded-md bg-gray-100 border border-transparent focus:border-[#6C27FF] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-gray-700 mb-2">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  placeholder="Your Last Name" 
                  className="w-full px-4 py-3 rounded-md bg-gray-100 border border-transparent focus:border-[#6C27FF] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter Your email Address" 
                className="w-full px-4 py-3 rounded-md bg-gray-100 border border-transparent focus:border-[#6C27FF] focus:bg-white focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Your Password" 
                  className="w-full px-4 py-3 rounded-md bg-gray-100 border border-transparent focus:border-[#6C27FF] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  placeholder="Confirm Your Password" 
                  className="w-full px-4 py-3 rounded-md bg-gray-100 border border-transparent focus:border-[#6C27FF] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <input 
                type="checkbox" 
                id="terms" 
                className="mr-2 h-4 w-4 text-[#6C27FF] border-gray-300 rounded focus:ring-[#6C27FF]"
              />
              <label htmlFor="terms" className="text-gray-700">
                I accept all <span className="text-[#6C27FF]">terms and condition</span>
              </label>
            </div>
            
            <button 
              className="w-full bg-[#6C27FF] text-white py-3 rounded-lg font-medium hover:bg-[#5620CC] transition-colors duration-300"
            >
              Sign Up
            </button>
            
            <div className="mt-4 text-center text-gray-700">
              Already have an account? {
                onSwitchToLogin ? (
                  <button onClick={onSwitchToLogin} className="text-[#6C27FF] hover:underline">Log in</button>
                ) : (
                  <Link href="/login" className="text-[#6C27FF] hover:underline">Log in</Link>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Popup Component 
export const LoginPopup = ({ 
  isOpen, 
  onClose, 
  onSwitchToSignup 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSwitchToSignup: () => void 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-lg animate-fade-in">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sign in to your account</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <label htmlFor="login-email" className="block text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              id="login-email" 
              placeholder="Enter your email" 
              className="w-full px-4 py-3 rounded-md bg-gray-100 border border-transparent focus:border-[#6C27FF] focus:bg-white focus:outline-none"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="login-password" className="block text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              id="login-password" 
              placeholder="Enter your password" 
              className="w-full px-4 py-3 rounded-md bg-gray-100 border border-transparent focus:border-[#6C27FF] focus:bg-white focus:outline-none"
            />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember-me" 
                className="mr-2 h-4 w-4 text-[#6C27FF] border-gray-300 rounded focus:ring-[#6C27FF]"
              />
              <label htmlFor="remember-me" className="text-gray-700 text-sm">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-[#6C27FF] hover:underline">
              Forgot password?
            </a>
          </div>
          
          <button 
            className="w-full bg-[#6C27FF] text-white py-3 rounded-lg font-medium hover:bg-[#5620CC] transition-colors duration-300"
          >
            Sign In
          </button>
          
          <div className="mt-4 text-center text-gray-700">
            Don't have an account? <button onClick={onSwitchToSignup} className="text-[#6C27FF] hover:underline">Sign up</button>
          </div>
        </div>
      </div>
    </div>
  );
}; 