"use client";

import { useParams, useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserIcon,
  PrinterIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Interfaces
interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface PrescriptionDetails {
  id: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorAvatar?: string;
  diagnosis?: string;
  notes?: string;
  medications: Medication[];
  createdAt: string;
  expiryDate?: string;
  status: string;
  formattedDate: string;
  formattedExpiryDate?: string;
  appointmentId?: string;
}

export default function PatientPrescriptionDetails() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = usePermissions();
  const prescriptionId = params.id as string;

  // Fetch prescription details
  const { data: prescriptionData, error: prescriptionError, isLoading: prescriptionLoading } = useSWR<PrescriptionDetails>(
    prescriptionId ? `/api/patient/prescriptions/${prescriptionId}` : null,
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
      dedupingInterval: 60000
    }
  );

  if (userLoading || prescriptionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (prescriptionError) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Prescription</h2>
        <p className="text-gray-500 mb-4">Unable to load prescription details. Please try again.</p>
        <Link
          href="/dashboard/patient/prescriptions"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Prescriptions
        </Link>
      </div>
    );
  }

  if (!prescriptionData) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Prescription Not Found</h2>
        <p className="text-gray-500 mb-4">The prescription you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/dashboard/patient/prescriptions"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Prescriptions
        </Link>
      </div>
    );
  }

  const prescription = prescriptionData;

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircleIcon },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', label: 'Expired', icon: XCircleIcon },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: CheckCircleIcon },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    );
  };

  // Handle print prescription
  const handlePrint = () => {
    const clinicName = "HealthCare Medical Center";
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescriptionId.substring(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${clinicName}</h1>
          <p>Prescription #${prescriptionId.substring(0, 8)}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Patient Information:</div>
          <p>Name: ${user?.name}</p>
          <p>Prescription Date: ${prescription.formattedDate}</p>
          ${prescription.formattedExpiryDate ? `<p>Expires: ${prescription.formattedExpiryDate}</p>` : ''}
        </div>
        
        <div class="section">
          <div class="section-title">Doctor Information:</div>
          <p>Dr. ${prescription.doctorName}</p>
          ${prescription.doctorSpecialty ? `<p>Specialty: ${prescription.doctorSpecialty}</p>` : ''}
        </div>
        
        ${prescription.diagnosis ? `
          <div class="section">
            <div class="section-title">Diagnosis:</div>
            <p>${prescription.diagnosis}</p>
          </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">Medications:</div>
          <table>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Quantity</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medications.map(med => `
                <tr>
                  <td>${med.name}${med.strength ? ` (${med.strength})` : ''}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                  <td>${med.quantity}</td>
                  <td>${med.instructions || 'Follow doctor instructions'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${prescription.notes ? `
          <div class="section">
            <div class="section-title">Additional Notes:</div>
            <p>${prescription.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>This prescription was issued on ${prescription.formattedDate}</p>
          <p>Please follow the prescribed dosage and consult your doctor if you have any concerns.</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Export as PDF-like data
  const handleDownload = () => {
    const csvHeaders = [
      'Medication',
      'Strength',
      'Dosage',
      'Frequency',
      'Duration',
      'Quantity',
      'Instructions'
    ];

    const csvRows = prescription.medications.map(medication => [
      medication.name,
      medication.strength || 'N/A',
      medication.dosage,
      medication.frequency,
      medication.duration,
      medication.quantity.toString(),
      medication.instructions || 'Follow doctor instructions'
    ]);

    const csvContent = [
      `Prescription #${prescriptionId.substring(0, 8)}`,
      `Doctor: Dr. ${prescription.doctorName}`,
      `Date: ${prescription.formattedDate}`,
      `Status: ${prescription.status}`,
      '',
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${prescriptionId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/patient/prescriptions"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Prescriptions
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Prescription Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prescription status card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Prescription Information</h2>
              {getStatusBadge(prescription.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="flex items-center font-medium">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                  {prescription.formattedDate}
                </p>
              </div>
              
              {prescription.formattedExpiryDate && (
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="flex items-center font-medium">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                    {prescription.formattedExpiryDate}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Prescription ID</p>
                <p className="font-medium font-mono text-sm">{prescriptionId.substring(0, 12)}...</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Total Medications</p>
                <p className="font-medium">{prescription.medications.length}</p>
              </div>
            </div>

            {prescription.diagnosis && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Diagnosis</p>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-blue-800">{prescription.diagnosis}</p>
                </div>
              </div>
            )}
          </div>

          {/* Medications List */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Medications</h2>
            
            <div className="space-y-4">
              {prescription.medications.map((medication, index) => (
                <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{medication.name}</h3>
                      {medication.genericName && (
                        <p className="text-sm text-gray-500">Generic: {medication.genericName}</p>
                      )}
                      {medication.strength && (
                        <p className="text-sm text-gray-500">Strength: {medication.strength}</p>
                      )}
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Dosage</p>
                      <p className="font-medium">{medication.dosage}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Frequency</p>
                      <p className="font-medium">{medication.frequency}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{medication.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="font-medium">{medication.quantity}</p>
                    </div>
                  </div>
                  
                  {medication.instructions && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">Instructions</p>
                      <p className="text-sm text-gray-700 mt-1">{medication.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {prescription.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Additional Instructions</p>
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-green-800">{prescription.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Doctor & Actions */}
        <div className="space-y-6">
          {/* Doctor card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Prescribed by</h2>
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                {prescription.doctorAvatar ? (
                  <img 
                    src={prescription.doctorAvatar} 
                    alt={prescription.doctorName} 
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="font-medium">Dr. {prescription.doctorName}</h3>
                {prescription.doctorSpecialty && (
                  <p className="text-sm text-gray-500">{prescription.doctorSpecialty}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/doctors/${prescription.doctorName.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
                View Doctor Profile
              </Link>
              
              <Link
                href={`/doctors/${prescription.doctorName.toLowerCase().replace(/\s+/g, '-')}/book`}
                className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
                Book Follow-up
              </Link>
              
              {prescription.appointmentId && (
                <Link
                  href={`/dashboard/patient/appointments/${prescription.appointmentId}`}
                  className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-purple-600" />
                  View Appointment
                </Link>
              )}
              
              <Link
                href={`/dashboard/patient/reviews/create?doctorName=${prescription.doctorName}`}
                className="flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <StarIcon className="w-5 h-5 mr-2 text-purple-600" />
                Rate Doctor
              </Link>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Reminders</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Take medications as prescribed</li>
              <li>• Complete the full course of treatment</li>
              <li>• Contact your doctor if you experience side effects</li>
              <li>• Store medications properly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 