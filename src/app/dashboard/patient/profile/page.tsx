"use client";

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import PasswordInput from '@/components/ui/PasswordInput';
import Image from 'next/image';
import { 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  CameraIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  IdentificationIcon,
  UserGroupIcon,
  LockClosedIcon,
  ArrowPathIcon,
  EyeIcon,
  BellIcon,
  CogIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { 
  UserIcon as UserSolidIcon,
  CheckCircleIcon as CheckCircleSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid
} from '@heroicons/react/24/solid';

export default function PatientProfile() {
  const { user, isLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState<'profile' | 'medical' | 'security' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalHistory: {
      allergies: '',
      chronicConditions: '',
      currentMedications: '',
      bloodType: '',
      height: '',
      weight: '',
      smokingStatus: '',
      alcoholConsumption: '',
      exerciseFrequency: ''
    },
    preferences: {
      appointmentReminders: true,
      medicationReminders: true,
      healthTips: true,
      newsletterSubscription: false,
      dataSharing: false
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        dateOfBirth: (user as any).dateOfBirth || '',
        gender: (user as any).gender || '',
        address: (user as any).address || ''
      }));
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <UserSolidIcon className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setMessage(null), 5000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating profile. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/patient/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error changing password. Please try again.' 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-pattern-dots"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/20 group-hover:scale-105 transition-transform duration-300">
                  {user && (user as any)?.avatar ? (
                    <Image
                      src={(user as any).avatar}
                      alt={user.name || 'Profile'}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <UserSolidIcon className="w-12 h-12 text-white" />
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Profile</h1>
                <p className="text-blue-100 text-lg mb-3">
                  Manage your personal information and account settings
                </p>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Account verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span className="text-sm">Secure profile</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <PencilIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-2xl border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          } shadow-lg`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircleSolid className="h-5 w-5 mr-3" />
              ) : (
                <ExclamationTriangleSolid className="h-5 w-5 mr-3" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'profile', label: 'Personal Info', icon: UserIcon },
              { key: 'medical', label: 'Medical History', icon: HeartIcon },
              { key: 'security', label: 'Security', icon: LockClosedIcon },
              { key: 'preferences', label: 'Preferences', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Personal Information</h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPinIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Enter your full address"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
                  Security Settings
                </h2>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <PasswordInput
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <PasswordInput
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medical History */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Medical History</h2>
                
                {/* Medical history content */}
              </div>

              {/* Allergies */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Allergies</h2>
                
                {/* Allergies content */}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
                  Security Settings
                </h2>
                
                {/* Security settings content */}
              </div>

              {/* Two-factor authentication */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
                  Two-factor Authentication
                </h2>
                
                {/* Two-factor authentication content */}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preferences */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Preferences</h2>
                
                {/* Preferences content */}
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Notification Settings</h2>
                
                {/* Notification settings content */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 