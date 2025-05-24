"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import { 
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CogIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const getNotificationIcon = (type: string, severity: string) => {
    let iconClass = 'h-6 w-6';
    let colorClass = '';
    
    switch (severity) {
      case 'high':
        colorClass = 'text-red-500';
        break;
      case 'medium':
        colorClass = 'text-yellow-500';
        break;
      default:
        colorClass = 'text-blue-500';
    }

    switch (type) {
      case 'appointment':
        return <CalendarDaysIcon className={`${iconClass} ${colorClass}`} />;
      case 'medication':
        return <ClipboardDocumentListIcon className={`${iconClass} ${colorClass}`} />;
      case 'health_reminder':
        return <HeartIcon className={`${iconClass} ${colorClass}`} />;
      case 'test_result':
        return <ClipboardDocumentListIcon className={`${iconClass} ${colorClass}`} />;
      case 'goal':
        return <CheckCircleIcon className={`${iconClass} ${colorClass}`} />;
      case 'prescription':
        return <ClipboardDocumentListIcon className={`${iconClass} ${colorClass}`} />;
      default:
        return <BellIcon className={`${iconClass} ${colorClass}`} />;
    }
  };

  const getNotificationBgColor = (notification: Notification) => {
    if (!notification.read) {
      switch (notification.severity) {
        case 'high':
          return 'bg-red-50 border-l-red-500';
        case 'medium':
          return 'bg-yellow-50 border-l-yellow-500';
        default:
          return 'bg-blue-50 border-l-blue-500';
      }
    }
    return 'bg-white border-l-gray-300';
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        mutateSettings(); // Refresh settings
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
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

  const unreadCount = notifications.filter(n => !n.read).length;
  const reminderCount = notifications.filter(n => n.actionRequired).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your health reminders and updates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Settings
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <BellSolidIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{notifications.length}</h3>
          <p className="text-sm text-gray-500">Total Notifications</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{unreadCount}</h3>
          <p className="text-sm text-gray-500">Unread</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{reminderCount}</h3>
          <p className="text-sm text-gray-500">Action Required</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'reminders', label: 'Reminders', count: reminderCount }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.key
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
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

            {/* Search and Filter */}
            <div className="flex space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {notificationsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : notificationsError ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-500">Error loading notifications. Please try again later.</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-l-4 hover:bg-gray-50 transition-colors ${getNotificationBgColor(notification)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type, notification.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        )}
                        {notification.actionRequired && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Action Required
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm ${!notification.read ? 'text-gray-600' : 'text-gray-500'} mb-2`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatDate(notification.date)}</span>
                        {notification.scheduledFor && (
                          <span>Scheduled: {formatDate(notification.scheduledFor)}</span>
                        )}
                        <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Mark as read"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete notification"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Notification Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Notification Types</h3>
              <div className="space-y-4">
                {[
                  { key: 'appointmentReminders', label: 'Appointment Reminders', icon: CalendarDaysIcon },
                  { key: 'medicationReminders', label: 'Medication Reminders', icon: ClipboardDocumentListIcon },
                  { key: 'healthTips', label: 'Health Tips & Advice', icon: HeartIcon },
                  { key: 'testResults', label: 'Test Results', icon: ClipboardDocumentListIcon },
                  { key: 'goalUpdates', label: 'Goal Updates', icon: CheckCircleIcon },
                  { key: 'systemUpdates', label: 'System Updates', icon: BellIcon }
                ].map((item) => (
                  <label key={item.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings[item.key as keyof NotificationSettings] as boolean}
                      onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="ml-3 flex items-center">
                      <item.icon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Methods */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Delivery Methods</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Email Notifications</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => updateSettings({ smsNotifications: e.target.checked })}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">SMS Notifications</span>
                </label>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Reminder Advance Time
                  </label>
                  <select
                    value={settings.reminderAdvance}
                    onChange={(e) => updateSettings({ reminderAdvance: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={1}>1 hour before</option>
                    <option value={2}>2 hours before</option>
                    <option value={6}>6 hours before</option>
                    <option value={12}>12 hours before</option>
                    <option value={24}>24 hours before</option>
                    <option value={48}>48 hours before</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 