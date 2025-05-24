"use client";

import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  PlusIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
  ScaleIcon,
  BeakerIcon,
  BoltIcon,
  AcademicCapIcon,
  StarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PlayIcon,
  FlagIcon,
  FireIcon,
  Bars3Icon,
  ShieldCheckIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  BoltIcon as BoltIconSolid
} from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  category: 'weight' | 'exercise' | 'nutrition' | 'sleep' | 'medication' | 'mental_health' | 'general';
  target: string;
  current: string;
  unit: string;
  startDate: string;
  deadline: string;
  progress: number;
  status: 'active' | 'completed' | 'overdue' | 'paused';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  milestones?: {
    id: string;
    title: string;
    target: string;
    completed: boolean;
    completedDate?: string;
  }[];
  reminder?: boolean;
  reminderTime?: string;
}

export default function HealthGoals() {
  const { user, isLoading: userLoading } = usePermissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch health goals
  const { data: goalsData, error: goalsError, isLoading: goalsLoading, mutate } = useSWR<{goals: HealthGoal[]}>(
    `/api/patient/health-goals?status=${statusFilter}&category=${categoryFilter}`,
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
            <StarIconSolid className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your health goals...</p>
        </div>
      </div>
    );
  }

  const goals = goalsData?.goals || [];

  // Use only real data from API
  const displayGoals = goals;

  // Filter goals based on search term and filters
  const filteredGoals = displayGoals.filter(goal => {
    if (!searchTerm && statusFilter === 'all' && categoryFilter === 'all') return true;
    
    let matchesSearch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      matchesSearch = (
        goal.title.toLowerCase().includes(searchLower) ||
        goal.description.toLowerCase().includes(searchLower) ||
        goal.category.toLowerCase().includes(searchLower)
      );
    }
    
    let matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    let matchesCategory = categoryFilter === 'all' || goal.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weight':
        return <ScaleIcon className="h-5 w-5" />;
      case 'exercise':
        return <BoltIconSolid className="h-5 w-5" />;
      case 'nutrition':
        return <BeakerIcon className="h-5 w-5" />;
      case 'sleep':
        return <SunIcon className="h-5 w-5" />;
      case 'medication':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'mental_health':
        return <HeartIcon className="h-5 w-5" />;
      default:
        return <ChartBarIconSolid className="h-5 w-5" />;
    }
  };

  const getCategoryCover = (category: string) => {
    switch (category) {
      case 'weight':
        return 'from-blue-500 to-blue-600';
      case 'exercise':
        return 'from-red-500 to-red-600';
      case 'nutrition':
        return 'from-green-500 to-green-600';
      case 'sleep':
        return 'from-purple-500 to-purple-600';
      case 'medication':
        return 'from-indigo-500 to-indigo-600';
      case 'mental_health':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const endDate = new Date(deadline);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'overdue') return 'bg-red-500';
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/patient/health-goals/${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
      } else {
        throw new Error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Error deleting goal. Please try again.');
    }
  };

  const updateGoalStatus = async (goalId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/patient/health-goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        mutate();
      } else {
        throw new Error('Failed to update goal status');
      }
    } catch (error) {
      console.error('Error updating goal status:', error);
      alert('Error updating goal. Please try again.');
    }
  };

  // Stats calculations
  const stats = {
    total: filteredGoals.length,
    active: filteredGoals.filter(g => g.status === 'active').length,
    completed: filteredGoals.filter(g => g.status === 'completed').length,
    overdue: filteredGoals.filter(g => g.status === 'overdue').length,
    averageProgress: filteredGoals.length > 0 ? Math.round(filteredGoals.reduce((sum, goal) => sum + goal.progress, 0) / filteredGoals.length) : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-700 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-pattern-dots"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <StarIconSolid className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Health Goals</h1>
                <p className="text-purple-100 text-lg">
                  Track and achieve your wellness objectives
                </p>
                <div className="flex items-center gap-4 mt-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{stats.active} active goals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4" />
                    <span className="text-sm">{stats.averageProgress}% average progress</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => mutate()}
                className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <ArrowTrendingUpIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Refresh Goals
              </button>
              <Link
                href="/dashboard/patient/health-goals/create"
                className="group inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Create New Goal
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FlagIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p className="text-gray-600 text-sm font-medium">All Goals</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</h3>
            <p className="text-gray-600 text-sm font-medium">In Progress</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIconSolid className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Done</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</h3>
            <p className="text-gray-600 text-sm font-medium">Completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              {stats.overdue > 0 && (
                <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full animate-pulse">Alert</span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.overdue}</h3>
            <p className="text-gray-600 text-sm font-medium">Overdue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ChartBarIconSolid className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Avg</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.averageProgress}%</h3>
            <p className="text-gray-600 text-sm font-medium">Progress</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-2">Search Goals</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-bold text-gray-900 mb-2">Status</label>
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
              <div className="relative">
                <FlagIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="weight">Weight</option>
                  <option value="exercise">Exercise</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="sleep">Sleep</option>
                  <option value="medication">Medication</option>
                  <option value="mental_health">Mental Health</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:w-48">
              <label className="block text-sm font-bold text-gray-900 mb-2">View Mode</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <StarIcon className="w-4 h-4 inline mr-1" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Bars3Icon className="w-4 h-4 inline mr-1" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Health Goals Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <FlagIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Health Goals</h2>
                <p className="text-gray-600 text-sm">
                  {filteredGoals.length} goal{filteredGoals.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {goalsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <StarIcon className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : goalsError ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Error loading health goals</p>
                <button 
                  onClick={() => mutate()}
                  className="text-purple-600 hover:text-purple-800 font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <StarIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No health goals found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchTerm 
                    ? `No goals match your search criteria "${searchTerm}"`
                    : 'Start your wellness journey by creating your first health goal.'
                  }
                </p>
                <Link
                  href="/dashboard/patient/health-goals/create"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Goal
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredGoals.map((goal) => (
                  <div key={goal.id} className={`group ${
                    viewMode === 'list' 
                      ? 'p-6 border-2 border-gray-100 rounded-2xl hover:border-purple-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30'
                      : 'p-6 border-2 border-gray-100 rounded-2xl hover:border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50/30'
                  }`}>
                    <div className="relative mb-4">
                      {/* Category Header */}
                      <div className={`h-2 rounded-t-xl bg-gradient-to-r ${getCategoryCover(goal.category)} -mx-6 -mt-6 mb-6`}></div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getCategoryCover(goal.category)} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                              {getCategoryIcon(goal.category)}
                            </div>
                            {goal.reminder && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                                <ClockIcon className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{goal.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{goal.description}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                            {goal.status === 'completed' && <CheckCircleIconSolid className="h-3 w-3 mr-1" />}
                            {goal.status === 'active' && <PlayIcon className="h-3 w-3 mr-1" />}
                            {goal.status === 'overdue' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                          </span>
                          <div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                              {goal.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-lg font-bold text-gray-900">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(goal.progress, goal.status)}`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                        <span>{goal.current} {goal.unit}</span>
                        <span>Target: {goal.target} {goal.unit}</span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500">Started:</span>
                          <p className="font-medium text-gray-900">{formatDate(goal.startDate)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">Deadline:</span>
                          <p className={`font-medium ${
                            getDaysRemaining(goal.deadline) < 7 && goal.status === 'active' ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {formatDate(goal.deadline)}
                            <span className="block text-xs text-gray-500">
                              ({getDaysRemaining(goal.deadline)} days {getDaysRemaining(goal.deadline) >= 0 ? 'left' : 'overdue'})
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {goal.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-sm text-yellow-900">
                          <span className="font-semibold">Notes:</span> {goal.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarDaysIcon className="w-3 h-3" />
                        <span className="capitalize">{goal.category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex gap-2">
                        {goal.status === 'active' && (
                          <button 
                            onClick={() => updateGoalStatus(goal.id, 'completed')}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-sm bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Complete
                          </button>
                        )}
                        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                          Details
                        </button>
                        <button 
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold text-sm bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 