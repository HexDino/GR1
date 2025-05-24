"use client";

import { useParams, useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  StarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface AppointmentDetails {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  date: string;
  time: string;
  status: string;
  type: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  formattedDate: string;
  formattedTime: string;
}

export default function PatientAppointmentDetails() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = usePermissions();
  const appointmentId = params.id as string;

  // Fetch appointment details
  const { data: appointmentData, error: appointmentError, isLoading: appointmentLoading } = useSWR<AppointmentDetails>(
    appointmentId ? `/api/patient/appointments/${appointmentId}` : null,
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000, // Refresh every minute
      dedupingInterval: 30000
    }
  );

  if (userLoading || appointmentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (appointmentError) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Appointment</h2>
        <p className="text-gray-500 mb-4">Unable to load appointment details. Please try again.</p>
        <Link
          href="/dashboard/patient/appointments"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Appointments
        </Link>
      </div>
    );
  }

  if (!appointmentData) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Appointment Not Found</h2>
        <p className="text-gray-500 mb-4">The appointment you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/dashboard/patient/appointments"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Appointments
        </Link>
      </div>
    );
  }

  const appointment = appointmentData;

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { color: 'bg-green-100 text-green-800', label: 'Confirmed', icon: CheckCircleIcon },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: ClockIcon },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircleIcon },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: CheckCircleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    );
  };

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await fetch(`/api/patient/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        router.push('/dashboard/patient/appointments?message=appointment-cancelled');
      } else {
        alert('Failed to cancel appointment. Please try again.');
      }
    } catch (error) {
      alert('Error cancelling appointment. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/patient/appointments"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Appointments
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          {appointment.status === 'CONFIRMED' && (
            <button
              onClick={handleCancelAppointment}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Cancel Appointment
            </button>
          )}
          {appointment.status === 'COMPLETED' && (
            <Link
              href={`/dashboard/patient/reviews/create?appointmentId=${appointment.id}`}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              <StarIcon className="h-4 w-4 mr-2" />
              Rate Doctor
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Appointment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment status card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Appointment Information</h2>
              {getStatusBadge(appointment.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="flex items-center font-medium">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                  {appointment.formattedDate}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="flex items-center font-medium">
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                  {appointment.formattedTime}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Appointment Type</p>
                <p className="font-medium">{appointment.type || 'In-person'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{new Date(appointment.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Symptoms & Diagnosis */}
          {(appointment.symptoms || appointment.diagnosis) && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h2>
              
              {appointment.symptoms && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Symptoms</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-700">{appointment.symptoms}</p>
                  </div>
                </div>
              )}
              
              {appointment.diagnosis && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Diagnosis</h3>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-blue-800">{appointment.diagnosis}</p>
                  </div>
                </div>
              )}
              
              {appointment.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Doctor&apos;s Notes</h3>
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-green-800">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - Doctor Info */}
        <div className="space-y-6">
          {/* Doctor card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Doctor Information</h2>
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                {appointment.doctorAvatar ? (
                  <img 
                    src={appointment.doctorAvatar} 
                    alt={appointment.doctorName} 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-8 w-8" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium">Dr. {appointment.doctorName}</h3>
                <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
              </div>
            </div>
            
            {appointment.doctorEmail && (
              <div className="mb-3">
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <a href={`mailto:${appointment.doctorEmail}`} className="text-purple-600 hover:text-purple-800">
                    {appointment.doctorEmail}
                  </a>
                </div>
              </div>
            )}
            
            {appointment.doctorPhone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <a href={`tel:${appointment.doctorPhone}`} className="text-purple-600 hover:text-purple-800">
                    {appointment.doctorPhone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/doctors/${appointment.doctorName.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
                View Doctor Profile
              </Link>
              
              <Link
                href={`/doctors/${appointment.doctorName.toLowerCase().replace(/\s+/g, '-')}/book`}
                className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
                Book Follow-up
              </Link>
              
              {appointment.status === 'COMPLETED' && (
                <Link
                  href="/dashboard/patient/prescriptions"
                  className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-purple-600" />
                  View Prescriptions
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 