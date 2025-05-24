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
  BoltIcon
} from '@heroicons/react/24/outline';

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
}

export default function HealthGoals() {
  const { user, isLoading: userLoading } = usePermissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch health goals
  const { data: goalsData, error: goalsError, isLoading: goalsLoading, mutate } = useSWR<{goals: HealthGoal[]}>(
    `/api/patient/health-goals?status=${statusFilter}&category=${categoryFilter}`,
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

  const goals = goalsData?.goals || [];

  // Filter and categorize goals
  const filteredGoals = goals.filter(goal => {
    if (statusFilter !== 'all' && goal.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && goal.category !== categoryFilter) return false;
    return true;
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
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weight':
        return <ScaleIcon className="h-5 w-5" />;
      case 'exercise':
        return <BoltIcon className="h-5 w-5" />;
      case 'nutrition':
        return <BeakerIcon className="h-5 w-5" />;
      case 'sleep':
        return <ClockIcon className="h-5 w-5" />;
      case 'mental_health':
        return <HeartIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
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
        mutate(); // Refresh the goals list
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
        mutate(); // Refresh the goals list
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
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    overdue: goals.filter(g => g.status === 'overdue').length,
    averageProgress: goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Health Goals</h1>
          <p className="text-gray-600 mt-1">Set, track, and achieve your health objectives</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/patient/health-goals/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Goal
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <ChartBarIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.total}</h3>
          <p className="text-sm text-gray-500">Total Goals</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.completed}</h3>
          <p className="text-sm text-gray-500">Completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              <BoltIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.active}</h3>
          <p className="text-sm text-gray-500">Active</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.averageProgress}%</h3>
          <p className="text-sm text-gray-500">Avg Progress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="weight">Weight Management</option>
                <option value="exercise">Exercise & Fitness</option>
                <option value="nutrition">Nutrition</option>
                <option value="sleep">Sleep</option>
                <option value="medication">Medication</option>
                <option value="mental_health">Mental Health</option>
                <option value="general">General Health</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Goals List */}
      {goalsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : goalsError ? (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500">Error loading goals. Please try again later.</p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No health goals found</p>
          <Link
            href="/dashboard/patient/health-goals/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Your First Goal
          </Link>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredGoals.map((goal) => (
            <div key={goal.id} className={`bg-white rounded-lg shadow-sm border border-gray-100 ${viewMode === 'list' ? 'p-4' : 'p-6'}`}>
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    goal.category === 'weight' ? 'bg-blue-100 text-blue-600' :
                    goal.category === 'exercise' ? 'bg-green-100 text-green-600' :
                    goal.category === 'nutrition' ? 'bg-yellow-100 text-yellow-600' :
                    goal.category === 'sleep' ? 'bg-purple-100 text-purple-600' :
                    goal.category === 'mental_health' ? 'bg-pink-100 text-pink-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{goal.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{goal.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                  <div className="relative">
                    <select
                      value={goal.status}
                      onChange={(e) => updateGoalStatus(goal.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(goal.status)} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.progress, goal.status)}`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Goal Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium text-gray-900">{goal.target} {goal.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-medium text-gray-900">{goal.current} {goal.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deadline:</span>
                  <span className={`font-medium ${
                    getDaysRemaining(goal.deadline) < 0 ? 'text-red-600' :
                    getDaysRemaining(goal.deadline) <= 7 ? 'text-yellow-600' :
                    'text-gray-900'
                  }`}>
                    {formatDate(goal.deadline)}
                    {getDaysRemaining(goal.deadline) >= 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({getDaysRemaining(goal.deadline)} days left)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Milestones Preview */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Milestones:</p>
                  <div className="space-y-1">
                    {goal.milestones.slice(0, 2).map((milestone) => (
                      <div key={milestone.id} className="flex items-center text-xs">
                        <CheckCircleIcon className={`h-3 w-3 mr-2 ${
                          milestone.completed ? 'text-green-500' : 'text-gray-300'
                        }`} />
                        <span className={milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                    {goal.milestones.length > 2 && (
                      <p className="text-xs text-gray-500">+{goal.milestones.length - 2} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link
                  href={`/dashboard/patient/health-goals/${goal.id}`}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  View Details
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/patient/health-goals/${goal.id}/edit`}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 