"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  StarIcon,
  BellAlertIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

// Thêm mới các components cho Schedule và Activity
interface ScheduleItemProps {
  patientInitials: string;
  patientName: string;
  time: string;
  service: string;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ patientInitials, patientName, time, service }) => (
  <div className="flex items-center justify-between py-4 border-b last:border-0">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
        <span className="text-purple-600 font-medium">{patientInitials}</span>
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{patientName}</h3>
        <p className="text-sm text-gray-600">{time} • {service}</p>
      </div>
    </div>
    <div className="flex space-x-2">
      <button className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-md hover:bg-green-200">
        Start
      </button>
      <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
        Details
      </button>
    </div>
  </div>
);

interface ActivityItemProps {
  patientName: string;
  action: string;
  date: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ patientName, action, date }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-0">
    <div>
      <span className="text-sm font-medium text-gray-900">{patientName}</span>
      <span className="text-sm text-gray-600"> {action}</span>
    </div>
    <div className="text-sm text-gray-500">
      {date}
    </div>
  </div>
);

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  bgColor: string;
  textColor: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  bgColor, 
  textColor,
  change 
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-start mb-4">
      <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center mr-4`}>
        <span className={textColor}>{icon}</span>
      </div>
      <div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-gray-500 text-sm">{title}</p>
      </div>
    </div>
    {change && (
      <div className={`text-xs flex items-center ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <ArrowTrendingUpIcon className={`h-3 w-3 mr-1 ${!change.isPositive ? 'transform rotate-180' : ''}`} />
        <span>{change.isPositive ? '+' : '-'}{change.value} from last month</span>
      </div>
    )}
  </div>
);

// Biểu đồ thanh đơn giản
const BarChart = ({ 
  data, 
  labels,
  height = "h-40",
  barColor = "bg-purple-500",
  hoverColor = "hover:bg-purple-600"
}: { 
  data: number[], 
  labels: string[],
  height?: string,
  barColor?: string,
  hoverColor?: string
}) => {
  const max = Math.max(...data);

  return (
    <div className={`w-full ${height} flex items-end space-x-2`}>
      {data.map((value, index) => {
        const heightPercent = max === 0 ? 0 : (value / max) * 100;
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full ${barColor} ${hoverColor} rounded-t-sm transition-all duration-200`}
              style={{ height: `${heightPercent}%` }}
            ></div>
            <div className="text-xs text-gray-500 mt-2">{labels[index]}</div>
          </div>
        );
      })}
    </div>
  );
};

// Types for API responses
interface DoctorStats {
  patientsCount: number;
  appointmentsCount: number;
  rating: number;
  reviewCount: number;
  earnings: number;
  earningsIncrease: number;
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
}

interface AppointmentData {
  id: string;
  patientName: string;
  patientImage: string;
  service: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

interface PatientData {
  id: string;
  name: string;
  image: string;
  condition: string;
  visitCount: number;
}

interface AnnouncementData {
  id: string;
  message: string;
  sender: string;
  senderImage: string;
  date: string;
}

interface ScheduleData {
  id: string;
  patientName: string;
  patientInitials: string;
  time: string;
  service: string;
}

export default function DoctorDashboard() {
  const { user, isLoading } = usePermissions();
  
  // State for statistics
  const [stats, setStats] = useState<DoctorStats>({
    patientsCount: 0,
    appointmentsCount: 0,
    rating: 0,
    reviewCount: 0,
    earnings: 0,
    earningsIncrease: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0
  });
  
  // State for appointments
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  
  // State for frequent patients
  const [frequentPatients, setFrequentPatients] = useState<PatientData[]>([]);
  
  // State for announcements
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  
  // State for schedule
  const [schedule, setSchedule] = useState<ScheduleData[]>([]);
  
  // State for activities
  const [activities, setActivities] = useState<ActivityItemProps[]>([]);
  
  // State for chart data
  const [chartData, setChartData] = useState<{
    weeklyAppointments: {data: number[], labels: string[]},
    monthlyRevenue: {data: number[], labels: string[]},
    patientDemographics: {data: number[], labels: string[]}
  }>({
    weeklyAppointments: {data: [], labels: []},
    monthlyRevenue: {data: [], labels: []},
    patientDemographics: {data: [], labels: []}
  });
  
  // State for loading states
  const [isDataLoading, setIsDataLoading] = useState({
    stats: true,
    appointments: true,
    patients: true,
    announcements: true,
    schedule: true,
    activities: true
  });
  
  // Use SWR for data fetching with automatic revalidation
  const { data: statsData, error: statsError } = useSWR('/api/doctor/stats', fetcher, { 
    refreshInterval: 30000, // Refresh every 30 seconds
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
    revalidateOnFocus: true
  });
  
  const { data: appointmentsData, error: appointmentsError } = useSWR('/api/doctor/appointments?status=pending', fetcher, {
    refreshInterval: 15000, // Refresh more frequently since appointments change often
    dedupingInterval: 2000
  });
  
  const { data: patientsData, error: patientsError } = useSWR('/api/doctor/patients/frequent', fetcher);
  
  const { data: announcementsData, error: announcementsError } = useSWR('/api/announcements', fetcher);
  
  const { data: scheduleData, error: scheduleError } = useSWR('/api/doctor/schedule', fetcher, {
    refreshInterval: 60000 // Refresh every minute
  });
  
  const { data: activitiesData, error: activitiesError } = useSWR('/api/doctor/activities', fetcher, {
    refreshInterval: 15000 // Refresh every 15 seconds
  });
  
  // Update states with SWR data
  useEffect(() => {
    if (statsData) {
      setStats(statsData);
      if (statsData.charts) {
        setChartData({
          weeklyAppointments: statsData.charts.weeklyAppointments,
          monthlyRevenue: statsData.charts.monthlyRevenue,
          patientDemographics: statsData.charts.patientDemographics
        });
      }
      setIsDataLoading(prev => ({ ...prev, stats: false }));
    }
    
    if (appointmentsData) {
      setAppointments(appointmentsData);
      setIsDataLoading(prev => ({ ...prev, appointments: false }));
    }
    
    if (patientsData) {
      setFrequentPatients(patientsData);
      setIsDataLoading(prev => ({ ...prev, patients: false }));
    }
    
    if (announcementsData) {
      setAnnouncements(announcementsData);
      setIsDataLoading(prev => ({ ...prev, announcements: false }));
    }
    
    if (scheduleData) {
      setSchedule(scheduleData);
      setIsDataLoading(prev => ({ ...prev, schedule: false }));
    }
    
    if (activitiesData) {
      setActivities(activitiesData);
      setIsDataLoading(prev => ({ ...prev, activities: false }));
    }
  }, [statsData, appointmentsData, patientsData, announcementsData, scheduleData, activitiesData]);
  
  // Fetch data from API
  useEffect(() => {
    // Don't fetch if user data is still loading
    if (isLoading) return;

    // Flag to track if component is mounted
    let isMounted = true;

    // Function to fetch doctor statistics
    const fetchDoctorStats = async () => {
      try {
        // Fetch data from API for all users including test account
        const response = await fetch('/api/doctor/stats');
        if (response.ok && isMounted) {
          const data = await response.json();
          setStats(data);
          
          if (data.charts) {
            setChartData({
              weeklyAppointments: data.charts.weeklyAppointments || {
                data: [5, 12, 8, 15, 10, 6, 8],
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              },
              monthlyRevenue: data.charts.monthlyRevenue || {
                data: [1200, 1800, 1500, 2200, 1800, 2500],
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
              },
              patientDemographics: data.charts.patientDemographics || {
                data: [25, 40, 15, 20],
                labels: ['0-18', '19-35', '36-55', '56+']
              }
            });
          }
        }
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, stats: false }));
        }
      } catch (error) {
        console.error("Error fetching doctor stats:", error);
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, stats: false }));
        }
      }
    };

    // Function to fetch upcoming appointments
    const fetchAppointments = async () => {
      try {
        // Fetch data from API for all users including test account
        const response = await fetch('/api/doctor/appointments?status=pending');
        if (response.ok && isMounted) {
          const data = await response.json();
          setAppointments(data);
        }
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, appointments: false }));
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, appointments: false }));
        }
      }
    };

    // Function to fetch frequent patients
    const fetchFrequentPatients = async () => {
      try {
        // Fetch data from API for all users including test account
        const response = await fetch('/api/doctor/patients/frequent');
        if (response.ok && isMounted) {
          const data = await response.json();
          setFrequentPatients(data);
        }
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, patients: false }));
        }
      } catch (error) {
        console.error("Error fetching frequent patients:", error);
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, patients: false }));
        }
      }
    };

    // Function to fetch announcements
    const fetchAnnouncements = async () => {
      try {
        // Fetch data from API for all users including test account
        const response = await fetch('/api/announcements');
        if (response.ok && isMounted) {
          const data = await response.json();
          setAnnouncements(data);
        }
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, announcements: false }));
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, announcements: false }));
        }
      }
    };

    // Function to fetch today's schedule
    const fetchSchedule = async () => {
      try {
        // Fetch data from API for all users including test account
        const response = await fetch('/api/doctor/schedule');
        if (response.ok && isMounted) {
          const data = await response.json();
          setSchedule(data);
        }
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, schedule: false }));
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, schedule: false }));
        }
      }
    };

    // Function to fetch recent patient activities
    const fetchActivities = async () => {
      try {
        // Fetch data from API for all users including test account
        const response = await fetch('/api/doctor/activities');
        if (response.ok && isMounted) {
          const data = await response.json();
          setActivities(data);
        }
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, activities: false }));
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        if (isMounted) {
          setIsDataLoading(prev => ({ ...prev, activities: false }));
        }
      }
    };

    // With SWR we don't need to fetch data manually anymore
    // The initial fetch and updating will be managed by SWR
    
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [isLoading, user?.id]); // Only re-run if isLoading or user.id changes

  // Display loading state while user info is loading
  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Hello, Dr. {user?.name || 'Smith'}
        </h1>
        <p className="text-gray-600">Here&apos;s what&apos;s happening with your practice today</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<CalendarIcon className="h-6 w-6" />}
          title="Today's Appointments"
          value={stats.todayAppointments}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
          change={{
            value: "23%",
            isPositive: true
          }}
        />
        
        <StatCard 
          icon={<UserGroupIcon className="h-6 w-6" />}
          title="Total Patients"
          value={stats.patientsCount.toLocaleString()}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
          change={{
            value: "12%",
            isPositive: true
          }}
        />
        
        <StatCard 
          icon={<StarIcon className="h-6 w-6" />}
          title="Rating"
          value={stats.rating}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
          change={{
            value: "0.3",
            isPositive: true
          }}
        />
        
        <StatCard 
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          title="Revenue"
          value={`$${stats.earnings.toLocaleString()}`}
          bgColor="bg-green-100"
          textColor="text-green-600"
          change={{
            value: "18%",
            isPositive: true
          }}
        />
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Appointment Overview</h2>
              <span className="text-sm text-gray-500">This month</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalAppointments}</div>
                <div className="text-xs text-gray-500 mt-1">Total</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedAppointments}</div>
                <div className="text-xs text-gray-500 mt-1">Completed</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.upcomingAppointments}</div>
                <div className="text-xs text-gray-500 mt-1">Upcoming</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.todayAppointments}</div>
                <div className="text-xs text-gray-500 mt-1">Today</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Weekly Appointments</h3>
              <BarChart 
                data={chartData.weeklyAppointments.data} 
                labels={chartData.weeklyAppointments.labels}
              />
            </div>
          </div>
          
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Today's Schedule</h2>
              <Link href="/dashboard/doctor/appointments" className="text-sm text-purple-600 hover:underline">
                View all
              </Link>
            </div>
            
            {isDataLoading.schedule ? (
              <div className="text-center py-6">Loading schedule...</div>
            ) : schedule.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No appointments scheduled for today</div>
            ) : (
              <div className="space-y-2">
                {schedule.map((item) => (
                  <ScheduleItem 
                    key={item.id}
                    patientInitials={item.patientInitials}
                    patientName={item.patientName}
                    time={item.time}
                    service={item.service}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Revenue</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded-md">
                  Monthly
                </button>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                  Yearly
                </button>
              </div>
            </div>
            
            <BarChart 
              data={chartData.monthlyRevenue.data} 
              labels={chartData.monthlyRevenue.labels}
              height="h-60"
              barColor="bg-green-500"
              hoverColor="hover:bg-green-600"
            />
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Patient Demographics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">Patient Demographics</h2>
            
            <BarChart 
              data={chartData.patientDemographics.data} 
              labels={chartData.patientDemographics.labels}
              height="h-40"
              barColor="bg-blue-500"
              hoverColor="hover:bg-blue-600"
            />
            
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500">Total Patients: {stats.patientsCount}</div>
            </div>
          </div>
          
          {/* Recent Patient Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
            
            {isDataLoading.activities ? (
              <div className="text-center py-6">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No recent activities</div>
            ) : (
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <ActivityItem 
                    key={index}
                    patientName={activity.patientName}
                    action={activity.action}
                    date={activity.date}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Link href="/dashboard/doctor/appointments/new" className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-center font-medium">
                New Appointment
              </Link>
              <Link href="/dashboard/doctor/patients" className="block w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-center font-medium">
                View Patients
              </Link>
              <Link href="/dashboard/doctor/messages" className="block w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-center font-medium">
                Messages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 