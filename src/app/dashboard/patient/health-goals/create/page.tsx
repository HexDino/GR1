"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  FlagIcon,
  StarIcon,
  ScaleIcon,
  BoltIcon,
  BeakerIcon,
  HeartIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  title: string;
  description: string;
  category: string;
  target: string;
  current: string;
  unit: string;
  startDate: string;
  deadline: string;
  priority: string;
  notes?: string;
  reminder: boolean;
  reminderTime?: string;
}

export default function CreateHealthGoal() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'weight',
    target: '',
    current: '',
    unit: 'kg',
    startDate: today,
    deadline: nextMonthStr,
    priority: 'medium',
    notes: '',
    reminder: false,
    reminderTime: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Calculate progress based on current and target values
      const current = parseFloat(formData.current);
      const target = parseFloat(formData.target);
      
      let progress = 0;
      if (!isNaN(current) && !isNaN(target) && target !== 0 && target !== current) {
        // If target is greater than current (increase goal)
        if (target > current) {
          progress = Math.round((current / target) * 100);
        } 
        // If target is less than current (decrease goal, e.g., weight loss)
        else {
          // We invert the calculation for reduction goals
          // 100% progress would be reaching the target or going beyond
          const startingPoint = current * 2 - target; // Logical starting point
          const range = startingPoint - target;
          progress = Math.round(((startingPoint - current) / range) * 100);
        }
      }
      
      // Clamp progress between 0 and 100
      progress = Math.max(0, Math.min(100, progress));

      const response = await fetch('/api/patient/health-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          progress
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create health goal');
      }

      // Navigate back to health goals list on success
      router.push('/dashboard/patient/health-goals');
      router.refresh();
    } catch (error) {
      console.error('Error creating health goal:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while creating health goal');
    } finally {
      setIsSubmitting(false);
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
      case 'medication':
        return <AcademicCapIcon className="h-5 w-5" />;
      case 'mental_health':
        return <HeartIcon className="h-5 w-5" />;
      default:
        return <StarIcon className="h-5 w-5" />;
    }
  };

  const getUnitOptions = (category: string) => {
    switch (category) {
      case 'weight':
        return ['kg', 'lbs'];
      case 'exercise':
        return ['steps', 'min', 'km', 'miles', 'workouts'];
      case 'nutrition':
        return ['calories', 'glasses', 'servings', 'meals'];
      case 'sleep':
        return ['hours', 'score'];
      case 'medication':
        return ['doses', 'pills', 'days'];
      case 'mental_health':
        return ['sessions', 'score', 'days'];
      default:
        return ['units', 'percent', 'occurrences'];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Create New Health Goal
              </h1>
              <p className="text-gray-600 mt-1">
                Set a new wellness objective to track your progress
              </p>
            </div>
            <div>
              <Link
                href="/dashboard/patient/health-goals"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Goals
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="E.g., Lose weight, Increase daily steps"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe your goal and why it's important to you"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                  >
                    <option value="weight">Weight</option>
                    <option value="exercise">Exercise</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="sleep">Sleep</option>
                    <option value="medication">Medication</option>
                    <option value="mental_health">Mental Health</option>
                    <option value="general">General</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {getCategoryIcon(formData.category)}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  required
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Target and Current Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Value <span className="text-red-500">*</span>
                </label>
                <input
                  id="current"
                  name="current"
                  type="text"
                  required
                  value={formData.current}
                  onChange={handleInputChange}
                  placeholder="Your starting point"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value <span className="text-red-500">*</span>
                </label>
                <input
                  id="target"
                  name="target"
                  type="text"
                  required
                  value={formData.target}
                  onChange={handleInputChange}
                  placeholder="Your goal value"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  id="unit"
                  name="unit"
                  required
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {getUnitOptions(formData.category).map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDaysIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FlagIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={handleInputChange}
                    min={formData.startDate}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-start">
                <input
                  id="reminder"
                  name="reminder"
                  type="checkbox"
                  checked={formData.reminder}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="ml-3">
                  <label htmlFor="reminder" className="text-sm font-medium text-gray-700">
                    Enable Reminders
                  </label>
                  <p className="text-xs text-gray-500">
                    Receive regular notifications to help you stay on track
                  </p>
                </div>
              </div>

              {formData.reminder && (
                <div className="mt-4">
                  <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Time
                  </label>
                  <div className="relative">
                    <ClockIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="reminderTime"
                      name="reminderTime"
                      type="time"
                      value={formData.reminderTime}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                placeholder="Any other details or thoughts"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Goal...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Create Health Goal
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 