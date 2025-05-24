"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon,
  CheckIcon,
  XCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  BellIcon as BellSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolid,
  CheckCircleIcon as CheckCircleSolid,
  ClockIcon as ClockSolid
} from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'medication' | 'health_reminder' | 'test_result' | 'system' | 'goal' | 'prescription';
  severity: 'low' | 'medium' | 'high';
  read: boolean;
  actionRequired: boolean;
  date: string;
  scheduledFor?: string;
  metadata?: {
    appointmentId?: string;
    medicationId?: string;
    goalId?: string;
    prescriptionId?: string;
    doctorName?: string;
  };
}

interface NotificationSettings {
  appointmentReminders: boolean;
  medicationReminders: boolean;
  healthTips: boolean;
  testResults: boolean;
  goalUpdates: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderAdvance: number; // hours before appointment
}

export default function Notifications() {
  const { user, isLoading: userLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'reminders' | 'settings'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Fetch notifications
  const { data: notificationsData, error: notificationsError, isLoading: notificationsLoading, mutate } = useSWR<{notifications: Notification[]}>(
    `/api/patient/notifications?tab=${activeTab}&type=${typeFilter}&search=${searchTerm}`,
    fetcher,
    { 
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  // Fetch notification settings
  const { data: settingsData, error: settingsError, isLoading: settingsLoading, mutate: mutateSettings } = useSWR<{settings: NotificationSettings}>(
    '/api/patient/notification-settings',
    fetcher,
    { 
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <BellSolidIcon className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your notifications...</p>
        </div>
      </div>
    );
  }

  const notifications = notificationsData?.notifications || [];
  const settings = settingsData?.settings || {
    appointmentReminders: true,
    medicationReminders: true,
    healthTips: true,
    testResults: true,
    goalUpdates: true,
    systemUpdates: true,
    emailNotifications: true,
    smsNotifications: false,
    reminderAdvance: 24
  };

  // Use only real data from API
  const displayNotifications = notifications;

  // Filter notifications
  const filteredNotifications = displayNotifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false;
    if (activeTab === 'reminders' && !notification.actionRequired) return false;
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const getNotificationIcon = (type: string, severity: string) => {
    const baseClass = 'w-6 h-6';
    
    switch (type) {
      case 'appointment':
        return <CalendarDaysIcon className={baseClass} />;
      case 'medication':
        return <ClipboardDocumentListIcon className={baseClass} />;
      case 'health_reminder':
        return <HeartIcon className={baseClass} />;
      case 'test_result':
        return <ClipboardDocumentListIcon className={baseClass} />;
      case 'goal':
        return <CheckCircleIcon className={baseClass} />;
      case 'prescription':
        return <ClipboardDocumentListIcon className={baseClass} />;
      case 'system':
        return <Cog6ToothIcon className={baseClass} />;
      default:
        return <BellIcon className={baseClass} />;
    }
  };

  const getNotificationColors = (type: string, severity: string) => {
    switch (severity) {
      case 'high':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          border: 'border-red-200',
          bg: 'bg-red-50'
        };
      case 'medium':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          border: 'border-yellow-200',
          bg: 'bg-yellow-50'
        };
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          border: 'border-blue-200',
          bg: 'bg-blue-50'
        };
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/patient/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        mutate(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/patient/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        mutate(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/patient/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const response = await fetch('/api/patient/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        mutateSettings(); // Refresh settings
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const unreadCount = displayNotifications.filter(n => !n.read).length;
  const reminderCount = displayNotifications.filter(n => n.actionRequired).length;
  const highPriorityCount = displayNotifications.filter(n => n.severity === 'high' && !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-pattern-dots"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <BellSolidIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Notifications</h1>
                <p className="text-blue-100 text-lg">
                  Stay updated with your health reminders and important updates
                </p>
                <div className="flex items-center gap-4 mt-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{displayNotifications.length} total notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span className="text-sm">{unreadCount} unread</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <Cog6ToothIcon className="w-5 h-5 mr-2 group-hover:animate-spin" />
                Settings
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="group inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CheckIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BellSolidIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{displayNotifications.length}</h3>
            <p className="text-gray-600 text-sm font-medium">All Notifications</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleSolid className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">Unread</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{unreadCount}</h3>
            <p className="text-gray-600 text-sm font-medium">Need Attention</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ClockSolid className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Action</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{reminderCount}</h3>
            <p className="text-gray-600 text-sm font-medium">Action Required</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <BoltIcon className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">High</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{highPriorityCount}</h3>
            <p className="text-gray-600 text-sm font-medium">High Priority</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              {[
                { key: 'all', label: 'All', count: displayNotifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'reminders', label: 'Reminders', count: reminderCount }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.key
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="appointment">Appointments</option>
                  <option value="medication">Medications</option>
                  <option value="health_reminder">Health Reminders</option>
                  <option value="test_result">Test Results</option>
                  <option value="goal">Goals</option>
                  <option value="prescription">Prescriptions</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Notifications</h2>
                <p className="text-gray-600 text-sm">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {notificationsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <BellIcon className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : notificationsError ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Error loading notifications</p>
                <button 
                  onClick={() => mutate()}
                  className="text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BellIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchTerm || typeFilter !== 'all' 
                    ? `No notifications match your criteria "${searchTerm || typeFilter}"`
                    : 'You\'re all caught up! No new notifications at this time.'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setActiveTab('all');
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const colors = getNotificationColors(notification.type, notification.severity);
                  return (
                    <div
                      key={notification.id}
                      className={`group p-6 border-2 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                        !notification.read 
                          ? `${colors.bg} ${colors.border} border-l-4` 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`flex-shrink-0 w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center ${colors.iconColor} group-hover:scale-105 transition-transform duration-300`}>
                            {getNotificationIcon(notification.type, notification.severity)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-bold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                              )}
                              {notification.actionRequired && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  <ClockIcon className="w-3 h-3 mr-1" />
                                  Action Required
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                                notification.severity === 'high' 
                                  ? 'bg-red-100 text-red-700' 
                                  : notification.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {notification.severity} priority
                              </span>
                            </div>
                            
                            <p className={`text-sm leading-relaxed mb-3 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                <span>{formatDate(notification.date)}</span>
                              </div>
                              {notification.scheduledFor && (
                                <div className="flex items-center gap-1">
                                  <CalendarDaysIcon className="w-3 h-3" />
                                  <span>Scheduled: {formatDate(notification.scheduledFor)}</span>
                                </div>
                              )}
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-lg capitalize">
                                {notification.type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete notification"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Cog6ToothIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                  <p className="text-gray-600 text-sm">Customize how and when you receive notifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Notification Types */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BellIcon className="w-5 h-5 text-indigo-600" />
                  Notification Types
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'appointmentReminders', label: 'Appointment Reminders', icon: CalendarDaysIcon, desc: 'Get notified about upcoming appointments' },
                    { key: 'medicationReminders', label: 'Medication Reminders', icon: ClipboardDocumentListIcon, desc: 'Reminders to take your medications' },
                    { key: 'healthTips', label: 'Health Tips & Advice', icon: HeartIcon, desc: 'Personalized health recommendations' },
                    { key: 'testResults', label: 'Test Results', icon: ClipboardDocumentListIcon, desc: 'Notifications when results are available' },
                    { key: 'goalUpdates', label: 'Goal Updates', icon: CheckCircleIcon, desc: 'Updates on your health goals progress' },
                    { key: 'systemUpdates', label: 'System Updates', icon: ShieldCheckIcon, desc: 'Important system announcements' }
                  ].map((item) => (
                    <div key={item.key} className="bg-white rounded-xl p-4 border border-gray-100">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof NotificationSettings] as boolean}
                          onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                          className="mt-1 h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <item.icon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{item.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Methods */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                  Delivery Methods
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                        className="mt-1 h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <InformationCircleIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">Email Notifications</span>
                        </div>
                        <p className="text-sm text-gray-600">Receive notifications in your email inbox</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => updateSettings({ smsNotifications: e.target.checked })}
                        className="mt-1 h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BoltIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">SMS Notifications</span>
                        </div>
                        <p className="text-sm text-gray-600">Get instant text message alerts</p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <label className="block">
                      <div className="flex items-center gap-2 mb-3">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">Appointment Reminder Timing</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">How far in advance should we remind you?</p>
                      <select
                        value={settings.reminderAdvance}
                        onChange={(e) => updateSettings({ reminderAdvance: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      >
                        <option value={1}>1 hour before</option>
                        <option value={2}>2 hours before</option>
                        <option value={6}>6 hours before</option>
                        <option value={12}>12 hours before</option>
                        <option value={24}>24 hours before</option>
                        <option value={48}>48 hours before</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 