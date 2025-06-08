"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/AuthModal';

interface Doctor {
  id: string;
  name: string;
  image: string;
  specialization: string;
  experience: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  image: string;
  facilities: string[];
  doctors: Doctor[];
}

const departments: Department[] = [
  {
    id: 'cardiology',
    name: 'Cardiology Department',
    description: 'Specialized care for heart and cardiovascular conditions',
    fullDescription: `Our Cardiology Department is equipped with state-of-the-art technology and staffed by highly skilled specialists. We provide comprehensive care for all types of heart conditions, from prevention to treatment and rehabilitation.

    Our team uses advanced diagnostic tools and the latest treatment methods to ensure the best possible outcomes for our patients. We specialize in both invasive and non-invasive procedures, including cardiac catheterization, echocardiography, and cardiac rehabilitation programs.`,
    image: '/images/Cardiology.jpg',
    facilities: [
      'Advanced Cardiac Catheterization Lab',
      'ECG and Echo Testing Units',
      'Cardiac Intensive Care Unit',
      'Rehabilitation Center'
    ],
    doctors: [
      {
        id: 'dr-smith',
        name: 'Dr. John Smith',
        image: '/doctors/handsome-doctor-portrait-isolated-transparent-background_812472-1772-removebg-preview.png',
        specialization: 'Interventional Cardiologist',
        experience: '15+ years of experience'
      },
      {
        id: 'dr-johnson',
        name: 'Dr. Sarah Johnson',
        image: '/doctors/female-doctor-portrait-isolated-transparent-background_1300605-3982-removebg-preview.png',
        specialization: 'Cardiac Surgeon',
        experience: '12+ years of experience'
      }
    ]
  },
  {
    id: 'neurology',
    name: 'Neurology Department',
    description: 'Expert treatment for neurological disorders',
    fullDescription: `The Neurology Department at our hospital provides comprehensive care for patients with neurological conditions affecting the brain, spinal cord, and peripheral nerves.

    Our neurologists utilize advanced diagnostic techniques including EEG, EMG, and state-of-the-art neuroimaging to accurately diagnose and treat complex neurological disorders. We offer specialized care for stroke, epilepsy, Parkinson's disease, multiple sclerosis, headaches, and other neurological conditions.`,
    image: '/images/Neurology.jpg',
    facilities: [
      'Advanced Neuroimaging Center',
      'EEG and EMG Testing Lab',
      'Stroke Unit',
      'Neuromuscular Disorder Clinic'
    ],
    doctors: [
      {
        id: 'dr-patel',
        name: 'Dr. Rahul Patel',
        image: '/doctors/pngtree-portrait-happy-male-doctor-isolated-on-transparent-background-png-image_13458207-removebg-preview.png',
        specialization: 'Neurologist',
        experience: '18+ years of experience'
      },
      {
        id: 'dr-kim',
        name: 'Dr. Jennifer Kim',
        image: '/doctors/2834942-png-portrait-of-a-beautiful-young-doctor-standing-with-arms-folded--fit_400_400-removebg-preview.png',
        specialization: 'Neurosurgeon',
        experience: '14+ years of experience'
      }
    ]
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics Department',
    description: 'Comprehensive healthcare for children and adolescents',
    fullDescription: `Our Pediatrics Department is dedicated to providing compassionate and expert care for children from birth through adolescence. We create a friendly, supportive environment where children feel comfortable and parents feel confident in the care their children receive.

    Our pediatric specialists work together to provide preventive care, treat common childhood illnesses, and manage complex pediatric conditions. We emphasize the importance of regular check-ups, immunizations, and developmental screenings to ensure children grow and develop healthily.`,
    image: '/images/Pediatrics.jpg',
    facilities: [
      'Child-friendly Examination Rooms',
      'Pediatric Emergency Unit',
      'Neonatal Intensive Care Unit',
      'Specialized Pediatric Therapy Rooms'
    ],
    doctors: [
      {
        id: 'dr-martinez',
        name: 'Dr. Elena Martinez',
        image: '/doctors/female-doctor-portrait-isolated-transparent-background_1300605-3611.avif',
        specialization: 'General Pediatrician',
        experience: '16+ years of experience'
      },
      {
        id: 'dr-thompson',
        name: 'Dr. Michael Thompson',
        image: '/doctors/2836935-png-shot-of-a-young-male-doctor--fit_400_400-removebg-preview.png',
        specialization: 'Pediatric Cardiologist',
        experience: '10+ years of experience'
      }
    ]
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics Department',
    description: 'Treatment for bone, joint, and muscle conditions',
    fullDescription: `The Orthopedics Department specializes in the diagnosis and treatment of conditions affecting the musculoskeletal system. Our experts provide care for a wide range of issues, from sports injuries and fractures to complex joint replacements and spine surgeries.

    We utilize minimally invasive techniques whenever possible to reduce recovery time and improve outcomes. Our multidisciplinary approach includes collaboration with physical therapists and pain management specialists to provide comprehensive care for all orthopedic conditions.`,
    image: '/images/Orthopedics.jpg',
    facilities: [
      'Advanced Surgical Suites',
      'Physical Therapy Center',
      'Sports Medicine Clinic',
      'Orthopedic Trauma Unit'
    ],
    doctors: [
      {
        id: 'dr-wilson',
        name: 'Dr. James Wilson',
        image: '/doctors/handsome-doctor-portrait-isolated-transparent-background_812472-1644.avif',
        specialization: 'Orthopedic Surgeon',
        experience: '20+ years of experience'
      },
      {
        id: 'dr-garcia',
        name: 'Dr. Sofia Garcia',
        image: '/doctors/970f1899a56020a2e34fa0554e94e29c-removebg-preview.png',
        specialization: 'Sports Medicine Specialist',
        experience: '12+ years of experience'
      }
    ]
  },
  {
    id: 'dermatology',
    name: 'Dermatology Department',
    description: 'Expert care for skin, hair, and nail conditions',
    fullDescription: `Our Dermatology Department provides comprehensive care for conditions affecting the skin, hair, and nails. From common issues like acne and eczema to more complex conditions such as psoriasis and skin cancer, our dermatologists offer advanced diagnostic and treatment options.

    We combine medical expertise with the latest cosmetic and laser technologies to provide both medical and aesthetic dermatology services. Our specialists are committed to helping patients maintain healthy skin throughout their lives.`,
    image: '/images/Dermatology.jpg',
    facilities: [
      'Medical Dermatology Clinic',
      'Cosmetic Dermatology Center',
      'Mohs Surgery Suite',
      'Phototherapy Unit'
    ],
    doctors: [
      {
        id: 'dr-chen',
        name: 'Dr. Lisa Chen',
        image: '/doctors/pexels-tima-miroshnichenko-5407249-removebg-preview.png',
        specialization: 'Medical Dermatologist',
        experience: '15+ years of experience'
      },
      {
        id: 'dr-ahmed',
        name: 'Dr. Hasan Ahmed',
        image: '/doctors/2834931-png-portrait-of-a-young-doctor-using-a-tablet-and-wearing-a-stethoscope--fit_400_400-removebg-preview.png',
        specialization: 'Cosmetic Dermatologist',
        experience: '11+ years of experience'
      }
    ]
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology Department',
    description: 'Specialized care for digestive system disorders',
    fullDescription: `The Gastroenterology Department focuses on the diagnosis and treatment of conditions affecting the digestive system, including the esophagus, stomach, intestines, liver, and pancreas.

    Our gastroenterologists perform endoscopic procedures such as colonoscopies and upper endoscopies to detect and treat a variety of gastrointestinal conditions. We employ a multidisciplinary approach to manage complex conditions like inflammatory bowel disease, liver disease, and gastrointestinal cancers.`,
    image: '/images/Gastroenterology.jpg',
    facilities: [
      'Advanced Endoscopy Center',
      'GI Function Lab',
      'Liver Center',
      'Nutritional Counseling Services'
    ],
    doctors: [
      {
        id: 'dr-rodriguez',
        name: 'Dr. Carlos Rodriguez',
        image: '/doctors/physician-doctor-of-medicine-clinic-pharmacy-others-thumbnail-removebg-preview.png',
        specialization: 'Gastroenterologist',
        experience: '17+ years of experience'
      },
      {
        id: 'dr-patel',
        name: 'Dr. Priya Patel',
        image: '/doctors/images-removebg-preview.png',
        specialization: 'Hepatologist',
        experience: '13+ years of experience'
      }
    ]
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology Department',
    description: 'Comprehensive eye care and vision treatments',
    fullDescription: `Our Ophthalmology Department provides complete eye care services, from routine vision exams to advanced surgical procedures. Our specialists diagnose and treat a wide range of eye conditions, including cataracts, glaucoma, macular degeneration, and diabetic retinopathy.

    Using the latest diagnostic equipment and surgical techniques, our ophthalmologists are committed to preserving and improving vision for patients of all ages. We also offer refractive surgery options for those seeking freedom from glasses or contact lenses.`,
    image: '/images/Ophthalmology.jpg',
    facilities: [
      'Comprehensive Eye Exam Rooms',
      'Advanced Cataract Surgery Center',
      'Laser Vision Correction Suite',
      'Retinal Imaging and Treatment Center'
    ],
    doctors: [
      {
        id: 'dr-lee',
        name: 'Dr. David Lee',
        image: '/doctors/doctor-png-11553965735yehesibskv-removebg-preview.png',
        specialization: 'Cataract and Refractive Surgeon',
        experience: '19+ years of experience'
      },
      {
        id: 'dr-sharma',
        name: 'Dr. Anita Sharma',
        image: '/doctors/images__1_-removebg-preview.png',
        specialization: 'Retina Specialist',
        experience: '14+ years of experience'
      }
    ]
  },
  {
    id: 'gynecology',
    name: 'Gynecology Department',
    description: "Specialized women's healthcare services",
    fullDescription: `The Gynecology Department provides comprehensive healthcare services for women of all ages. Our specialists offer routine preventive care, family planning, pregnancy care, and treatment for a wide range of gynecological conditions.

    We take a holistic approach to women's health, addressing physical, emotional, and hormonal aspects of care. Our department is equipped with advanced diagnostic and treatment technologies, and our providers are committed to creating a comfortable and respectful environment for all patients.`,
    image: '/images/Gynecology.jpg',
    facilities: [
      'Women\'s Health Clinic',
      'Advanced Obstetric Ultrasound Suite',
      'Minimally Invasive Surgery Center',
      'Maternal-Fetal Medicine Unit'
    ],
    doctors: [
      {
        id: 'dr-miller',
        name: 'Dr. Rebecca Miller',
        image: '/doctors/pngtree-doctor-isolated-on-transparent-background-png-image_14109968-removebg-preview.png',
        specialization: 'Obstetrician-Gynecologist',
        experience: '16+ years of experience'
      },
      {
        id: 'dr-nguyen',
        name: 'Dr. Tran Nguyen',
        image: '/doctors/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA5L3M4OC1wb20tMTgyOS1qb2IxMjcyLnBuZw-removebg-preview.png',
        specialization: 'Reproductive Endocrinologist',
        experience: '12+ years of experience'
      }
    ]
  }
];

export default function DepartmentDetail() {
  const params = useParams();
  const [department, setDepartment] = useState<Department | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const handleBookAppointment = () => {
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const dept = departments.find(d => d.id === params.id);
    setDepartment(dept || null);
  }, [params.id]);

  if (!department) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Department not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="container mx-auto px-4">
        {/* Department Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div 
            className={`relative w-full transition-all duration-700 ease-out ${
              isHovered ? 'h-[600px]' : 'h-[300px]'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={department.image}
              alt={department.name}
              fill
              className={`object-cover transition-all duration-700 ease-out ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{department.name}</h1>
            <p className="text-gray-600 whitespace-pre-line">{department.fullDescription}</p>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {department.facilities.map((facility, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full" />
                <span className="text-gray-700">{facility}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Doctors */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Specialists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {department.doctors.map((doctor) => (
              <div key={doctor.id} className="bg-gray-50 rounded-lg p-6">
                <div className="relative w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full overflow-hidden shadow-md">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover scale-110"
                    style={{ 
                      objectPosition: 'center top',
                      mixBlendMode: 'multiply',
                      filter: 'contrast(1.1) saturate(1.1)'
                    }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{doctor.name}</h3>
                  <p className="text-purple-600 mb-1">{doctor.specialization}</p>
                  <p className="text-gray-600 text-sm mb-4">{doctor.experience}</p>
                  <button 
                    onClick={handleBookAppointment}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-purple-700 w-full"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode="signup"
        />
      </div>
    </div>
  );
} 