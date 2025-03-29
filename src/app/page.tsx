'use client'

import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaQuoteLeft, FaCalendarAlt, FaPhoneAlt, FaClock, FaStar } from 'react-icons/fa';
import { useState, useEffect } from 'react';

// Define the Doctor interface
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  galleryImages?: string[];
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
}

export default function Home() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch doctors from the API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/doctors?take=4'); // Limit to 4 doctors for homepage
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const data = await response.json();
        setDoctors(data.doctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', {
      doctorName,
      selectedSpeciality,
      isAvailable
    });
    // Here you would implement the actual search logic
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full px-6 md:px-16 py-10 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-[#6C27FF] text-4xl md:text-5xl font-bold">We care</h1>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mt-1">about your health</h2>
              </div>
              <p className="text-gray-600 md:pr-10 mt-2">
                Good health is the state of mental, physical and social well being and it does not just mean absence of diseases.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/appointment" 
                  className="bg-[#6C27FF] text-white px-8 py-3 rounded-full hover:bg-[#5620CC] hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C27FF]/30 flex items-center justify-center gap-2 text-center"
                >
                  Book an appointment <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link href="/videos" 
                  className="group border border-[#6C27FF] text-[#6C27FF] px-8 py-3 rounded-full hover:bg-[#6C27FF] hover:text-white hover:-translate-y-1 transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2 text-center"
                >
                  <div className="h-6 w-6 rounded-full bg-[#6C27FF] group-hover:bg-white flex items-center justify-center transition-colors duration-300">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.75 4.31698L2.5 0.761982C2.41667 0.715315 2.33333 0.694982 2.25 0.699982C2.16667 0.704982 2.08333 0.731649 2 0.779982C1.91667 0.831649 1.85417 0.891649 1.8125 0.959982C1.77083 1.02832 1.75 1.09898 1.75 1.17498V8.82498C1.75 8.90098 1.77083 8.97165 1.8125 9.03998C1.85417 9.10832 1.91667 9.16832 2 9.21998C2.08333 9.26832 2.16667 9.29498 2.25 9.29998C2.33333 9.30498 2.41667 9.28465 2.5 9.23798L8.75 5.68298C8.83333 5.63298 8.89583 5.56998 8.9375 5.49398C8.97917 5.41798 9 5.33632 9 5.24998C9 5.16365 8.97917 5.08198 8.9375 5.00598C8.89583 4.92998 8.83333 4.86698 8.75 4.81698V4.31698Z" fill="white" className="group-hover:fill-[#6C27FF] transition-all duration-300"/>
                    </svg>
                  </div>
                  Watch videos
                </Link>
              </div>
            </div>
            
            <div className="relative h-[550px] flex items-center justify-center translate-y-[-50px]" style={{ transform: 'translateX(60px)' }}>
              <div className="absolute w-[480px] h-[480px] rounded-full border-[25px] border-gray-100"></div>
              <div className="absolute w-[420px] h-[420px] rounded-full bg-[#6C27FF] overflow-hidden">
                <div className="relative w-[650px] h-[650px] -left-[100px]" style={{ transform: 'translateY(-50px)' }}>
                  <Image 
                    src="/doctors.png" 
                    alt="Professional Doctors" 
                    fill
                    quality={100}
                    priority
                    className="object-cover"
                    style={{ objectPosition: '50% 25%' }}
                  />
                </div>
              </div>
              
              {/* Feature cards */}
              <div className="absolute top-[15%] left-[-30px] max-w-[280px] rounded-[32px] bg-white shadow-lg px-5 py-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 z-20 hover:bg-gradient-to-br hover:from-white hover:to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#6C27FF] transition-all duration-300 hover:bg-[#6C27FF] hover:text-white group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Well Qualified doctors</h3>
                    <p className="text-sm text-gray-600">Treat with care</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-[50%] left-[-90px] transform -translate-y-1/2 max-w-[280px] rounded-[32px] bg-white shadow-lg px-5 py-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#6C27FF] transition-all duration-300 hover:bg-[#6C27FF] hover:text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Book an appointment</h3>
                    <p className="text-sm text-gray-600">Online appointment</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-[50%] right-[-70px] transform -translate-y-1/2 max-w-[280px] rounded-[32px] bg-white shadow-lg px-5 py-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#6C27FF] transition-all duration-300 hover:bg-[#6C27FF] hover:text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4741 21.8325 20.7294C21.7209 20.9848 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27097 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0494 2.28271 3.30326 2.17052C3.55712 2.05833 3.83049 2.00026 4.10999 2H7.10999C7.59524 1.99522 8.06573 2.16708 8.43369 2.48353C8.80166 2.79999 9.04201 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Contact no</h3>
                    <p className="text-sm text-gray-600">+97151287 1325</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Find a doctor search box */}
          <div className="max-w-3xl bg-[#F8F9FC] border border-gray-100 rounded-xl shadow-md p-6 mt-2 mb-6 transition-all duration-300 hover:shadow-lg hover:border-purple-200">
            <h3 className="font-medium text-gray-800 mb-3">Find a doctor</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[140px]">
                <input 
                  type="text" 
                  placeholder="Name of Doctor" 
                  className="w-full bg-white border border-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C27FF]/30 focus:border-[#6C27FF] transition-all duration-300"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[140px] relative">
                <select 
                  className="w-full bg-white border border-gray-100 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#6C27FF]/30 focus:border-[#6C27FF] transition-all duration-300"
                  value={selectedSpeciality}
                  onChange={(e) => setSelectedSpeciality(e.target.value)}
                >
                  <option value="">Select Speciality</option>
                  <option value="gynecology">Gynecology</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="oncology">Oncology</option>
                  <option value="ophthalmology">Ophthalmology</option>
                  <option value="general_medicine">General Medicine</option>
                  <option value="psychiatry">Psychiatry</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#6C27FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-gray-700">Availability</span>
                <div className={`w-16 h-8 rounded-full relative transition-colors duration-300 ${isAvailable ? 'bg-[#5620CC]' : 'bg-gray-300'} hover:shadow-md`}>
                  <input 
                    type="checkbox" 
                    id="availability-toggle"
                    className="sr-only" 
                    checked={isAvailable}
                    onChange={() => setIsAvailable(!isAvailable)}
                  />
                  <label htmlFor="availability-toggle" className="w-full h-full block cursor-pointer">
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${isAvailable ? 'left-9' : 'left-1'} hover:shadow-md`}></div>
                  </label>
                </div>
              </div>
              <button 
                className="bg-[#5620CC] text-white px-8 py-3 rounded-lg hover:bg-[#461CA5] hover:-translate-y-1 transition-all duration-300 whitespace-nowrap hover:shadow-lg hover:shadow-[#6C27FF]/20"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Services Section */}
      <section className="w-full px-6 md:px-16 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h4 className="text-[#6C27FF] font-medium text-lg">Our Medical Services</h4>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">High Quality Medical Services</h2>
            </div>
            <Link href="/services" className="mt-4 md:mt-0 flex items-center text-[#6C27FF] hover:underline">
              View All Services <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "/icons/new/cardiology.png",
                title: "Cardiology",
                description: "Expert care for heart health with advanced diagnostic and treatment options."
              },
              {
                icon: "/icons/new/neurology.png",
                title: "Neurology",
                description: "Specialized care for conditions affecting the brain, spinal cord, and nervous system."
              },
              {
                icon: "/icons/new/pulmonology.png",
                title: "Pulmonology",
                description: "Comprehensive care for respiratory conditions and lung health management."
              },
              {
                icon: "/icons/new/ophthalmology.png",
                title: "Ophthalmology",
                description: "Advanced eye care services including vision correction and treatment of eye disorders."
              },
              {
                icon: "/icons/new/pediatrics.png",
                title: "Pediatrics",
                description: "Compassionate care for children from birth through adolescence, focusing on growth and development."
              },
              {
                icon: "/icons/new/orthopedics.png",
                title: "Orthopedics",
                description: "Specialized treatment for musculoskeletal issues, including joint replacements and rehabilitation."
              }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="p-8">
                  <div className="w-16 h-16 bg-[#F3E8FF] rounded-2xl mb-5 flex items-center justify-center">
                    <Image src={service.icon} alt={service.title} width={40} height={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link href={`/services/${service.title.toLowerCase()}`} className="text-[#6C27FF] font-medium flex items-center hover:underline">
                    Learn More <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="w-full px-6 md:px-16 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Meet our Doctors</h2>
            <p className="text-gray-600 mt-2">Well qualified doctors are ready to serve you</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C27FF]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-500 group hover:-translate-y-2 hover:border-[#6C27FF]/20 hover:border">
                    <div className="relative">
                      {doctor.isAvailable && (
                        <div className="absolute top-3 left-3 z-10 bg-white py-0.5 px-2 rounded-full text-xs text-[#6C27FF] font-medium flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6C27FF] mr-1"></span>
                          Available
                        </div>
                      )}
                      <div className="bg-[#6C27FF] w-full aspect-square overflow-hidden">
                        <Image 
                          src={doctor.imageUrl || "/doctors/placeholder.jpg"} // Use placeholder if no image
                          alt={doctor.name} 
                          width={300}
                          height={300}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-[#6C27FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#6C27FF] transition-all duration-300">{doctor.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">{doctor.specialty}</p>
                      <div className="flex justify-center items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`text-sm mx-0.5 group-hover:animate-pulse ${
                              i < Math.floor(doctor.rating) 
                                ? "text-[#6C27FF]" 
                                : "text-gray-300"
                            }`} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({doctor.reviewCount || 0})</span>
                      </div>
                      <Link 
                        href={`/doctors/${doctor.id}`}
                        className="w-full py-2 border border-[#6C27FF] text-[#6C27FF] rounded-lg text-sm font-medium relative overflow-hidden group-hover:text-white transition-colors duration-300 block"
                      >
                        <span className="relative z-10">View Profile</span>
                        <div className="absolute inset-0 bg-[#6C27FF] -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-12 text-gray-500">
                  No doctors found. Please check back later.
                </div>
              )}
            </div>
          )}
          
          <div className="mt-10 text-center">
            <Link 
              href="/doctors" 
              className="inline-flex items-center justify-center px-6 py-3 bg-[#6C27FF] text-white rounded-full font-medium hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C27FF]/30"
            >
              View All Doctors <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="w-full px-6 md:px-16 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative h-[500px] w-full rounded-2xl overflow-hidden">
                <Image 
                  src="/healthcare/hospital-building-new.jpg" 
                  alt="Hospital Building" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white rounded-2xl p-6 shadow-lg max-w-xs">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full mt-1">
                    <FaClock className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">24/7 Medical Services</h3>
                    <p className="text-gray-600 mt-2">Our facilities are available around the clock to ensure you receive care whenever you need it.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <h4 className="text-[#6C27FF] font-medium text-lg">Why Choose Us</h4>
              <h2 className="text-3xl font-bold text-gray-800">Providing Quality Healthcare Solutions for Over 20 Years</h2>
              <p className="text-gray-600">
                We are committed to providing exceptional care with state-of-the-art technology and a compassionate approach. Our experienced team of specialists ensures you receive the best medical attention.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                {[
                  {
                    title: "Qualified Doctors",
                    description: "Our team consists of board-certified specialists with extensive experience."
                  },
                  {
                    title: "Emergency Care",
                    description: "Immediate assistance available 24/7 for all medical emergencies."
                  },
                  {
                    title: "Modern Equipment",
                    description: "State-of-the-art technology for accurate diagnosis and treatment."
                  },
                  {
                    title: "Patient-Centered Approach",
                    description: "Personalized care plans tailored to individual patient needs."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 group transition-all duration-300">
                    <div className="bg-green-100 p-2 rounded-full mt-1 transition-colors duration-300">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#22C55E"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 transition-colors duration-300">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/about" 
                className="bg-[#6C27FF] text-white px-8 py-3 rounded-full hover:bg-[#5620CC] transition-all duration-300 hover:shadow-lg hover:shadow-[#6C27FF]/30 mt-4 w-fit flex items-center"
              >
                Learn More About Us <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full px-6 md:px-16 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h4 className="text-[#6C27FF] font-medium text-lg">Testimonials</h4>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">What Our Patients Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Robert Johnson",
                role: "Patient",
                image: "/testimonials/patient1.png",
                quote: "The level of care I received was exceptional. The doctors took the time to listen and develop a treatment plan that worked for me."
              },
              {
                name: "Emma Williams",
                role: "Patient",
                image: "/testimonials/patient2.png",
                quote: "From the moment I walked in, I felt welcomed. The staff was professional and the facilities are state-of-the-art. Highly recommend!"
              },
              {
                name: "David Thompson",
                role: "Patient",
                image: "/testimonials/patient3.png",
                quote: "After struggling with my condition for years, the specialists here provided the solutions I needed. I'm grateful for their expertise."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 flex flex-col hover:bg-gradient-to-br hover:from-white hover:to-purple-50">
                <FaQuoteLeft className="text-[#6C27FF] opacity-20 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-gray-600 italic mb-6 flex-grow">{testimonial.quote}</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[#6C27FF] transition-all duration-300">
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      width={48} 
                      height={48} 
                      className="object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 hover:text-[#6C27FF] transition-colors duration-300">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="w-full px-6 md:px-16 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h4 className="text-[#6C27FF] font-medium text-lg">Latest Articles</h4>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">Health Tips & News</h2>
            </div>
            <Link href="/blog" className="mt-4 md:mt-0 flex items-center text-[#6C27FF] hover:underline">
              View All Articles <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                category: "Health Tips",
                date: "Jun 12, 2023",
                title: "Tips for Maintaining a Healthy Heart",
                excerpt: "Learn about lifestyle changes and dietary habits that promote heart health and reduce the risk of cardiovascular disease."
              },
              {
                category: "Medical Research",
                date: "May 28, 2023",
                title: "Advancements in Cancer Treatment",
                excerpt: "Discover the latest breakthroughs in cancer research and how new treatments are improving patient outcomes."
              },
              {
                category: "Wellness",
                date: "May 15, 2023",
                title: "Managing Stress in Modern Life",
                excerpt: "Explore effective strategies for managing stress and improving your mental health in today's fast-paced world."
              }
            ].map((article, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#6C27FF] text-sm font-medium">{article.category}</span>
                    <span className="text-gray-500 text-sm">{article.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#6C27FF] transition-colors duration-300">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <Link href={`/blog/${article.title.toLowerCase().replace(/\s/g, '-')}`} className="text-[#6C27FF] flex items-center group">
                    Read More <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="w-full px-6 md:px-16 py-16">
        <div className="max-w-6xl mx-auto bg-[#6C27FF] rounded-3xl p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="200" fill="white"/>
              <circle cx="200" cy="200" r="150" fill="white"/>
              <circle cx="200" cy="200" r="100" fill="white"/>
            </svg>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-white opacity-90 mb-6">
                Stay updated with the latest health tips, medical advancements, and hospital news. Join our community for valuable insights and information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto flex-grow"
                />
                <button className="bg-white text-[#6C27FF] px-8 py-3 rounded-full hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium">
                  Subscribe Now
                </button>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-end">
              <Image 
                src="/newsletter-illustration.png" 
                alt="Newsletter" 
                width={300} 
                height={300} 
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 