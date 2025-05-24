"use client";

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import {   HeartIcon,  BeakerIcon,  ScaleIcon,  ClockIcon,  ArrowTrendingUpIcon,  ArrowTrendingDownIcon,  ExclamationTriangleIcon,  CheckCircleIcon,  PlusIcon,  CalendarDaysIcon,  BoltIcon} from '@heroicons/react/24/outline';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

interface HealthMetric {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'weight' | 'blood_sugar' | 'temperature';
  value: string;
  date: string;
  notes?: string;
}

interface HealthGoal {
  id: string;
  title: string;
  target: string;
  current: string;
  progress: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
}

interface HealthAlert {
  id: string;
  type: 'medication' | 'appointment' | 'checkup' | 'goal';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  read: boolean;
}

export default function HealthDashboard() {
  const { user, isLoading: userLoading } = usePermissions();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch health metrics
  const { data: metricsData, error: metricsError, isLoading: metricsLoading } = useSWR<{metrics: HealthMetric[]}>(
    `/api/patient/health-metrics?range=${selectedTimeRange}`,
    fetcher,
    { 
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // Fetch health goals
  const { data: goalsData, error: goalsError, isLoading: goalsLoading } = useSWR<{goals: HealthGoal[]}>(
    '/api/patient/health-goals',
    fetcher,
    { 
      revalidateOnFocus: false,
      refreshInterval: 300000,
    }
  );

  // Fetch health alerts
  const { data: alertsData, error: alertsError, isLoading: alertsLoading } = useSWR<{alerts: HealthAlert[]}>(
    '/api/patient/health-alerts',
    fetcher,
    { 
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute for alerts
    }
  );

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const metrics = metricsData?.metrics || [];
  const goals = goalsData?.goals || [];
  const alerts = alertsData?.alerts || [];

  // Process metrics for display
  const getLatestMetric = (type: string) => {
    return metrics.filter(m => m.type === type).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getMetricTrend = (type: string) => {
    const typeMetrics = metrics.filter(m => m.type === type).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (typeMetrics.length < 2) return 'stable';
    
    const latest = parseFloat(typeMetrics[typeMetrics.length - 1].value);
    const previous = parseFloat(typeMetrics[typeMetrics.length - 2].value);
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  const getHealthScore = () => {
    // Calculate health score based on various factors
    let score = 75; // Base score
    
    // Adjust based on recent metrics
    const recentMetrics = metrics.filter(m => {
      const metricDate = new Date(m.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return metricDate >= weekAgo;
    });

    if (recentMetrics.length > 3) score += 10; // Bonus for regular monitoring
    
    // Adjust based on goals completion
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalGoals = goals.length;
    if (totalGoals > 0) {
      score += (completedGoals / totalGoals) * 15;
    }

    // Penalize for high severity alerts
    const highAlerts = alerts.filter(a => a.severity === 'high' && !a.read).length;
    score -= highAlerts * 5;

    return Math.max(Math.min(Math.round(score), 100), 0);
  };

  const healthScore = getHealthScore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300"></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Health Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your health metrics and track your wellness journey
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/patient/health-records"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Health Data
          </Link>
        </div>
      </div>

      {/* Health Score Card */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Your Health Score</h2>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">{healthScore}/100</div>
              <div className="flex items-center text-purple-200">
                <BoltIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">
                  {healthScore >= 85 ? 'Excellent' : 
                   healthScore >= 70 ? 'Good' : 
                   healthScore >= 55 ? 'Fair' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </div>
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-purple-300 opacity-30"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                className="text-white transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <HeartIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Blood Pressure */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              <HeartIcon className="h-6 w-6" />
            </div>
            {getTrendIcon(getMetricTrend('blood_pressure'))}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Blood Pressure</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getLatestMetric('blood_pressure')?.value || 'No data'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getLatestMetric('blood_pressure') ? formatDate(getLatestMetric('blood_pressure').date) : 'Never recorded'}
          </p>
        </div>

        {/* Heart Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
              <HeartIcon className="h-6 w-6" />
            </div>
            {getTrendIcon(getMetricTrend('heart_rate'))}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Heart Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getLatestMetric('heart_rate')?.value || 'No data'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getLatestMetric('heart_rate') ? formatDate(getLatestMetric('heart_rate').date) : 'Never recorded'}
          </p>
        </div>

        {/* Weight */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <ScaleIcon className="h-6 w-6" />
            </div>
            {getTrendIcon(getMetricTrend('weight'))}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Weight</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getLatestMetric('weight')?.value || 'No data'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getLatestMetric('weight') ? formatDate(getLatestMetric('weight').date) : 'Never recorded'}
          </p>
        </div>

        {/* Blood Sugar */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <BeakerIcon className="h-6 w-6" />
            </div>
            {getTrendIcon(getMetricTrend('blood_sugar'))}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Blood Sugar</h3>
          <p className="text-2xl font-bold text-gray-900">
            {getLatestMetric('blood_sugar')?.value || 'No data'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getLatestMetric('blood_sugar') ? formatDate(getLatestMetric('blood_sugar').date) : 'Never recorded'}
          </p>
        </div>
      </div>

      {/* Health Goals and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Goals */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Health Goals</h2>
            <Link
              href="/dashboard/patient/health-goals"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              View All
            </Link>
          </div>

          {goalsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No health goals set</p>
              <Link
                href="/dashboard/patient/health-goals/create"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Set Your First Goal
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Target: {goal.target} | Current: {goal.current}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Health Alerts</h2>
            <Link
              href="/dashboard/patient/notifications"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              View All
            </Link>
          </div>

          {alertsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">No active alerts</p>
                             <p className="text-sm text-gray-400 mt-1">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(alert.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Health Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/patient/health-records/add"
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-4">
              <PlusIcon className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Log Health Data</h3>
            <p className="text-sm text-gray-500">Record your vital signs and measurements</p>
          </Link>

          <Link 
            href="/dashboard/patient/health-goals/create"
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors mb-4">
              <CalendarDaysIcon className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Set Health Goal</h3>
            <p className="text-sm text-gray-500">Create personalized health targets</p>
          </Link>

                    <Link            href="/dashboard/patient/health-goals"            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"          >
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-4">
              <BoltIcon className="h-6 w-6" />
            </div>
                        <h3 className="font-medium text-gray-800 mb-2">Health Goals</h3>            <p className="text-sm text-gray-500">View and manage your health goals</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 