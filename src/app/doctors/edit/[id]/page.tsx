'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DoctorImageUpload from '@/components/DoctorImageUpload';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  imageUrl: string;
  galleryImages: string[];
  bio: string;
  education: string;
  experience: number;
  consultationFee: number;
  isAvailable: boolean;
  availableDays: string[];
  availableHours: string[];
}

export default function DoctorEditPage() {
  const params = useParams();
  const doctorId = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchDoctorData();
    }
  }, [status, doctorId]);
  
  const fetchDoctorData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctor data');
      }
      
      const data = await response.json();
      setDoctor(data);
      
      // Populate form fields
      setSpecialty(data.specialty || '');
      setBio(data.bio || '');
      setEducation(data.education || '');
      setExperience(data.experience ? data.experience.toString() : '');
      setConsultationFee(data.consultationFee ? data.consultationFee.toString() : '');
      setIsAvailable(data.isAvailable || false);
      setAvailableDays(data.availableDays || []);
      setAvailableHours(data.availableHours || []);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError('Could not load doctor information');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDayToggle = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
      // Remove the corresponding hour
      const index = availableDays.indexOf(day);
      const newHours = [...availableHours];
      newHours.splice(index, 1);
      setAvailableHours(newHours);
    } else {
      setAvailableDays([...availableDays, day]);
      // Add a default hour
      setAvailableHours([...availableHours, '09:00 - 17:00']);
    }
  };
  
  const handleHourChange = (index: number, value: string) => {
    const newHours = [...availableHours];
    newHours[index] = value;
    setAvailableHours(newHours);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('You must be logged in to update your profile');
      return;
    }
    
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/doctors/${doctorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specialty,
          bio,
          education,
          experience: experience ? parseInt(experience) : undefined,
          consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
          isAvailable,
          availableDays,
          availableHours,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      setSuccess('Profile updated successfully!');
      
      // Refresh data
      fetchDoctorData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C27FF]"></div>
      </div>
    );
  }
  
  if (!doctor) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error || 'Doctor not found'}
      </div>
    );
  }
  
  // Check if current user is the doctor or an admin
  const isOwnerOrAdmin = 
    session?.user?.email === doctor.email || 
    (session?.user as any)?.role === 'ADMIN';
  
  if (!isOwnerOrAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        You do not have permission to edit this profile.
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Doctor Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update your information and manage your profile images.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                Specialty *
              </label>
              <input
                type="text"
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#6C27FF] focus:border-[#6C27FF] sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#6C27FF] focus:border-[#6C27FF] sm:text-sm"
                placeholder="Tell patients about yourself, your background, and your approach to medicine..."
              />
            </div>
            
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                Education
              </label>
              <textarea
                id="education"
                rows={3}
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#6C27FF] focus:border-[#6C27FF] sm:text-sm"
                placeholder="List your degrees, certifications, etc."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                  Experience (years)
                </label>
                <input
                  type="number"
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#6C27FF] focus:border-[#6C27FF] sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                  Consultation Fee ($)
                </label>
                <input
                  type="number"
                  id="consultationFee"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#6C27FF] focus:border-[#6C27FF] sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 text-[#6C27FF] focus:ring-[#6C27FF] border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Available for appointments
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {weekdays.map((day) => (
                  <div key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="h-4 w-4 text-[#6C27FF] focus:ring-[#6C27FF] border-gray-300 rounded"
                    />
                    <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-gray-700">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {availableDays.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Hours
                </label>
                <div className="space-y-3">
                  {availableDays.map((day, index) => (
                    <div key={day} className="flex items-center">
                      <span className="w-24 text-sm text-gray-700">{day}:</span>
                      <input
                        type="text"
                        value={availableHours[index] || ''}
                        onChange={(e) => handleHourChange(index, e.target.value)}
                        placeholder="e.g. 09:00 - 17:00"
                        className="ml-2 block w-48 border-gray-300 rounded-md shadow-sm focus:ring-[#6C27FF] focus:border-[#6C27FF] sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Format: HH:MM - HH:MM (e.g. 09:00 - 17:00)
                </p>
              </div>
            )}
            
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C27FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6C27FF] ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#5620CC]'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C27FF]`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Image Upload Section */}
        <DoctorImageUpload 
          doctorId={doctorId}
          currentImage={doctor.imageUrl}
          galleryImages={doctor.galleryImages}
          onSuccess={() => fetchDoctorData()}
        />
      </div>
    </main>
  );
} 