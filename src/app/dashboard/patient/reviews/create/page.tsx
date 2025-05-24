"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  StarIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatar?: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  status: string;
}

export default function CreateReview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: userLoading } = usePermissions();
  
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Get pre-filled data from URL params
  const prefilledDoctorId = searchParams.get('doctorId');
  const prefilledAppointmentId = searchParams.get('appointmentId');

  // Fetch completed appointments for doctor selection
  const { data: appointmentsData, error: appointmentsError, isLoading: appointmentsLoading } = useSWR<{appointments: Appointment[]}>(
    '/api/patient/appointments?status=COMPLETED&limit=50',
    fetcher
  );

  // Fetch available doctors
  const { data: doctorsData, error: doctorsError, isLoading: doctorsLoading } = useSWR<{doctors: Doctor[]}>(
    '/api/doctors?available=true',
    fetcher
  );

  // Pre-fill form if URL params are provided
  useEffect(() => {
    if (prefilledDoctorId) {
      setSelectedDoctorId(prefilledDoctorId);
    }
    if (prefilledAppointmentId) {
      setSelectedAppointmentId(prefilledAppointmentId);
    }
  }, [prefilledDoctorId, prefilledAppointmentId]);

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const appointments = appointmentsData?.appointments || [];
  const doctors = doctorsData?.doctors || [];

  // Filter appointments by selected doctor
  const filteredAppointments = selectedDoctorId 
    ? appointments.filter(apt => apt.doctorId === selectedDoctorId)
    : appointments;

  // Get selected doctor info
  const selectedDoctor = doctors.find(doc => doc.id === selectedDoctorId);
  const selectedAppointment = appointments.find(apt => apt.doctorId === selectedDoctorId);
  
  const doctorInfo = selectedDoctor ? {
    avatar: selectedDoctor.avatar,
    name: selectedDoctor.name,
    specialization: selectedDoctor.specialization
  } : selectedAppointment ? {
    avatar: undefined,
    name: selectedAppointment.doctorName,
    specialization: selectedAppointment.doctorSpecialty
  } : null;

  // Render star rating selector
  const renderStarSelector = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {star <= rating ? (
              <StarIconSolid className="w-8 h-8 text-yellow-400" />
            ) : (
              <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating === 1 && "Poor"}
          {rating === 2 && "Fair"}
          {rating === 3 && "Good"}
          {rating === 4 && "Very Good"}
          {rating === 5 && "Excellent"}
        </span>
      </div>
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctorId) {
      setSubmitError('Please select a doctor to review.');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      setSubmitError('Please select a rating between 1 and 5 stars.');
      return;
    }
    
    if (!comment.trim()) {
      setSubmitError('Please write a review comment.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/patient/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          appointmentId: selectedAppointmentId || undefined,
          rating,
          comment: comment.trim(),
          isAnonymous
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/dashboard/patient/reviews');
      } else {
        setSubmitError(data.message || 'Failed to create review. Please try again.');
      }
    } catch (error) {
      setSubmitError('An error occurred while creating the review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/patient/reviews"
          className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Reviews
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Write a Doctor Review</h1>
        <p className="text-gray-600 mt-1">
          Share your experience to help other patients make informed decisions.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor Selection */}
          <div>
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
              Select Doctor *
            </label>
            <select
              id="doctor"
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedAppointmentId(''); // Reset appointment when doctor changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Choose a doctor...</option>
              {/* From appointments */}
              {appointments.map((appointment) => (
                <option key={`apt-${appointment.doctorId}`} value={appointment.doctorId}>
                  Dr. {appointment.doctorName} - {appointment.doctorSpecialty}
                </option>
              ))}
              {/* From doctors list */}
              {doctors.filter(doctor => !appointments.some(apt => apt.doctorId === doctor.id)).map((doctor) => (
                <option key={`doc-${doctor.id}`} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Selection (Optional) */}
          {selectedDoctorId && filteredAppointments.length > 0 && (
            <div>
              <label htmlFor="appointment" className="block text-sm font-medium text-gray-700 mb-2">
                Related Appointment (Optional)
              </label>
              <select
                id="appointment"
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">No specific appointment</option>
                {filteredAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {formatDate(appointment.date)} - {appointment.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected Doctor Preview */}
          {doctorInfo && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">Reviewing:</h4>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                  {doctorInfo.avatar ? (
                    <img 
                      src={doctorInfo.avatar} 
                      alt={doctorInfo.name} 
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Dr. {doctorInfo.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {doctorInfo.specialization}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            {renderStarSelector()}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Review Comment *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Share your experience with this doctor. Was the doctor professional? How was the treatment? Would you recommend them to others?"
              required
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
              Post this review anonymously
            </label>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* Loading states */}
          {(appointmentsLoading || doctorsLoading) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-600 text-sm">Loading doctors and appointments...</p>
            </div>
          )}

          {/* Error states */}
          {(appointmentsError || doctorsError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">Error loading data. Please refresh the page.</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !selectedDoctorId || appointmentsLoading || doctorsLoading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating Review...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
            <Link
              href="/dashboard/patient/reviews"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be honest and constructive in your feedback</li>
          <li>• Focus on your personal experience with the doctor</li>
          <li>• Avoid sharing personal medical information</li>
          <li>• Keep your review professional and respectful</li>
          <li>• Help other patients by being specific about your experience</li>
        </ul>
      </div>
    </div>
  );
} 