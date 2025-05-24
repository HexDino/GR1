"use client";

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  HeartIcon,
  BeakerIcon,
  ScaleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  CalendarDaysIcon,
  BoltIcon,
  FireIcon,
  EyeIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  FireIcon as FireIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  BeakerIcon as BeakerIconSolid
} from '@heroicons/react/24/solid';

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
  status: 'normal' | 'warning' | 'critical';
}

interface HealthGoal {
  id: string;
  title: string;
  target: string;
  current: string;
  progress: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  category: 'fitness' | 'nutrition' | 'medication' | 'checkup';
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch health metrics
  const { data: metricsData, error: metricsError, isLoading: metricsLoading } = useSWR<{metrics: HealthMetric[]}>(
    `/api/patient/health-metrics?range=${selectedTimeRange}`,
    fetcher,
    { 
      revalidateOnFocus: false,
      refreshInterval: 300000,
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
      refreshInterval: 60000,
    }
  );

  // Fetch health score
  const { data: healthScoreData, error: healthScoreError, isLoading: healthScoreLoading } = useSWR<{score: number}>(
    '/api/patient/health-score',
    fetcher,
    { 
      revalidateOnFocus: false,
      refreshInterval: 300000,
    }
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <HeartIconSolid className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = metricsData?.metrics || [];
  const goals = goalsData?.goals || [];
  const alerts = alertsData?.alerts || [];

  // Use only real data from API
  const displayMetrics = metrics;
  const displayGoals = goals;
  const displayAlerts = alerts;

  // Get health score from API or default to 0
  const healthScore = healthScoreData?.score || 0;

  // Process metrics for display
  const getLatestMetric = (type: string) => {
    return displayMetrics.filter(m => m.type === type).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getMetricTrend = (type: string) => {
    const typeMetrics = displayMetrics.filter(m => m.type === type).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (typeMetrics.length < 2) return 'stable';
    
    const latest = parseFloat(typeMetrics[typeMetrics.length - 1].value.split('/')[0] || typeMetrics[typeMetrics.length - 1].value);
    const previous = parseFloat(typeMetrics[typeMetrics.length - 2].value.split('/')[0] || typeMetrics[typeMetrics.length - 2].value);
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

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

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return <HeartIconSolid className="w-6 h-6" />;
      case 'heart_rate':
        return <BeakerIconSolid className="w-6 h-6" />;
      case 'weight':
        return <ChartBarIconSolid className="w-6 h-6" />;
      case 'temperature':
        return <FireIconSolid className="w-6 h-6" />;
      case 'blood_sugar':
        return <BeakerIcon className="w-6 h-6" />;
      default:
        return <HeartIcon className="w-6 h-6" />;
    }
  };

  const getMetricUnit = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return 'mmHg';
      case 'heart_rate':
        return 'BPM';
      case 'weight':
        return 'kg';
      case 'temperature':
        return '°F';
      case 'blood_sugar':
        return 'mg/dL';
      default:
        return '';
    }
  };

  const getMetricName = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return 'Blood Pressure';
      case 'heart_rate':
        return 'Heart Rate';
      case 'weight':
        return 'Weight';
      case 'temperature':
        return 'Temperature';
      case 'blood_sugar':
        return 'Blood Sugar';
      default:
        return type;
    }
  };

  const getGoalIcon = (category: string) => {
    switch (category) {
      case 'fitness':
        return <BoltIcon className="w-5 h-5" />;
      case 'nutrition':
        return <BeakerIcon className="w-5 h-5" />;
      case 'medication':
        return <ClockIcon className="w-5 h-5" />;
      case 'checkup':
        return <AcademicCapIcon className="w-5 h-5" />;
      default:
        return <StarIcon className="w-5 h-5" />;
    }
  };

  const getGoalCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'nutrition':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medication':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'checkup':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-pattern-dots"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <ChartBarIconSolid className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Health Dashboard</h1>
                <p className="text-blue-100 text-lg">
                  Monitor your wellness journey and track health metrics
                </p>
                <div className="flex items-center gap-4 mt-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Health tracking active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">
                      Last updated: {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-1">
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      selectedTimeRange === range
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
              <Link
                href="/dashboard/patient/health-goals"
                className="group inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Add Health Data
              </Link>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Overall Health Score</h2>
                <p className="text-gray-600">Based on your recent health metrics and goals</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-600">{healthScore}</div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                healthScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                healthScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">Normal Metrics</div>
                <div className="text-sm text-gray-600">{displayMetrics.filter(m => m.status === 'normal').length} out of {displayMetrics.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <StarIcon className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">Active Goals</div>
                <div className="text-sm text-gray-600">{displayGoals.filter(g => g.status === 'active').length} in progress</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="font-semibold text-gray-900">Pending Alerts</div>
                <div className="text-sm text-gray-600">{displayAlerts.filter(a => !a.read).length} require attention</div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <h2 className="col-span-full text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-purple-600" />
            Current Health Metrics
          </h2>
          
          {displayMetrics.map((metric) => (
            <div key={metric.id} className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  metric.status === 'normal' ? 'bg-green-50 text-green-600' :
                  metric.status === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {getMetricIcon(metric.type)}
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(getMetricTrend(metric.type))}
                  <div className={`w-3 h-3 rounded-full ${
                    metric.status === 'normal' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  } animate-pulse`}></div>
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1">{getMetricName(metric.type)}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                <span className="text-sm text-gray-500">{getMetricUnit(metric.type)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Updated: {formatDate(metric.date)}</span>
                <span className={`capitalize px-2 py-1 rounded-full font-medium ${
                  metric.status === 'normal' ? 'bg-green-100 text-green-700' :
                  metric.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {metric.status}
                </span>
              </div>
              
              {metric.notes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-900">{metric.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Health Goals and Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Health Goals */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Health Goals</h2>
                    <p className="text-gray-600 text-sm">Track your wellness objectives</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/patient/health-goals"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold text-sm bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100 transition-all duration-200"
                >
                  <EyeIcon className="w-4 h-4" />
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {displayGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-purple-50/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getGoalCategoryColor(goal.category)}`}>
                          {getGoalIcon(goal.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                          <p className="text-sm text-gray-600">{goal.current} of {goal.target}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{goal.progress}%</div>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                          goal.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {goal.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.progress >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          goal.progress >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Deadline: {new Date(goal.deadline).toLocaleDateString('en-US')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health Alerts */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Health Alerts</h3>
                  <p className="text-gray-600 text-sm">Important notifications</p>
                </div>
              </div>

              <div className="space-y-4">
                {displayAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {formatDate(alert.date)}
                        </div>
                      </div>
                      {!alert.read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard/patient/notifications"
                className="block w-full mt-4 text-center py-3 text-orange-600 hover:text-orange-800 font-semibold text-sm bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                View All Alerts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 