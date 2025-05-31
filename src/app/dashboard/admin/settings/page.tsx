"use client";

import { useState } from 'react';
import {
  Cog6ToothIcon,
  BellIcon,
  LockClosedIcon,
  UserIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Mock settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'HealthCare Admin',
    siteDescription: 'Advanced healthcare management system',
    emailContact: 'admin@healthcare.com',
    phoneContact: '+1 (555) 123-4567',
    timezone: 'UTC+0',
    dateFormat: 'MM/DD/YYYY',
    language: 'en-US'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    systemUpdates: true,
    marketingEmails: false,
    newUserRegistrations: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiration: 90,
    loginAttempts: 5,
    ipRestriction: false
  });

  const handleSave = () => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      // Randomly success or error for demonstration
      const result = Math.random() > 0.2 ? 'success' : 'error';
      setSaveStatus(result);
      
      if (result === 'success') {
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 1500);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Site Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Site Description</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={generalSettings.emailContact}
                    onChange={(e) => setGeneralSettings({...generalSettings, emailContact: e.target.value})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={generalSettings.phoneContact}
                    onChange={(e) => setGeneralSettings({...generalSettings, phoneContact: e.target.value})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <div className="mt-1">
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="UTC-12">UTC-12</option>
                    <option value="UTC-11">UTC-11</option>
                    <option value="UTC-10">UTC-10</option>
                    <option value="UTC-9">UTC-9</option>
                    <option value="UTC-8">UTC-8</option>
                    <option value="UTC-7">UTC-7</option>
                    <option value="UTC-6">UTC-6</option>
                    <option value="UTC-5">UTC-5</option>
                    <option value="UTC-4">UTC-4</option>
                    <option value="UTC-3">UTC-3</option>
                    <option value="UTC-2">UTC-2</option>
                    <option value="UTC-1">UTC-1</option>
                    <option value="UTC+0">UTC+0</option>
                    <option value="UTC+1">UTC+1</option>
                    <option value="UTC+2">UTC+2</option>
                    <option value="UTC+3">UTC+3</option>
                    <option value="UTC+4">UTC+4</option>
                    <option value="UTC+5">UTC+5</option>
                    <option value="UTC+6">UTC+6</option>
                    <option value="UTC+7">UTC+7</option>
                    <option value="UTC+8">UTC+8</option>
                    <option value="UTC+9">UTC+9</option>
                    <option value="UTC+10">UTC+10</option>
                    <option value="UTC+11">UTC+11</option>
                    <option value="UTC+12">UTC+12</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Date Format</label>
                <div className="mt-1">
                  <select
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="YYYY.MM.DD">YYYY.MM.DD</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <div className="mt-1">
                  <select
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Email Notifications</label>
                  <p className="text-gray-500">Receive notifications via email for important updates.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-gray-500">Receive notifications via SMS for critical alerts.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationSettings.appointmentReminders}
                    onChange={(e) => setNotificationSettings({...notificationSettings, appointmentReminders: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Appointment Reminders</label>
                  <p className="text-gray-500">Receive reminders about upcoming appointments.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationSettings.systemUpdates}
                    onChange={(e) => setNotificationSettings({...notificationSettings, systemUpdates: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">System Updates</label>
                  <p className="text-gray-500">Receive notifications about system updates and maintenance.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationSettings.marketingEmails}
                    onChange={(e) => setNotificationSettings({...notificationSettings, marketingEmails: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Marketing Emails</label>
                  <p className="text-gray-500">Receive promotional and marketing materials.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationSettings.newUserRegistrations}
                    onChange={(e) => setNotificationSettings({...notificationSettings, newUserRegistrations: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">New User Registrations</label>
                  <p className="text-gray-500">Receive notifications when new users register.</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Two-Factor Authentication</label>
                  <p className="text-gray-500">Require a verification code in addition to password when logging in.</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    min="5"
                    max="240"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">How long until an inactive session is logged out.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Password Expiration (days)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={securitySettings.passwordExpiration}
                    onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiration: parseInt(e.target.value)})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Number of days before passwords expire. Set to 0 to disable.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Failed Login Attempts</label>
                <div className="mt-1">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Number of failed login attempts before account is temporarily locked.</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={securitySettings.ipRestriction}
                    onChange={(e) => setSecuritySettings({...securitySettings, ipRestriction: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">IP Restriction</label>
                  <p className="text-gray-500">Restrict login to specific IP addresses or ranges.</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          System Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure and manage system preferences
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:grid md:grid-cols-4 md:gap-6">
          {/* Sidebar / Tabs */}
          <div className="md:col-span-1 bg-gray-50">
            <div className="p-6 space-y-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'general' 
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Cog6ToothIcon className="mr-3 h-5 w-5" />
                General
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'notifications' 
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BellIcon className="mr-3 h-5 w-5" />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'security' 
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LockClosedIcon className="mr-3 h-5 w-5" />
                Security
              </button>
            </div>
          </div>
          
          {/* Settings content */}
          <div className="md:col-span-3 p-6">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="pt-6 flex items-center justify-end space-x-4">
              {saveStatus === 'success' && (
                <div className="flex items-center text-green-600">
                  <CheckIcon className="h-5 w-5 mr-1" />
                  <span>Changes saved successfully!</span>
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                  <span>Error saving changes. Please try again.</span>
                </div>
              )}
              
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  saveStatus === 'saving'
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 