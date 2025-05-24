"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  const values = [
    {
      title: "Patient-Centered Care",
      description: "We put patients at the center of everything we do, providing personalized care that respects individual needs and preferences.",
      icon: "❤️"
    },
    {
      title: "Excellence",
      description: "We strive for the highest standards in healthcare delivery, continuously improving our services and outcomes.",
      icon: "🌟"
    },
    {
      title: "Integrity",
      description: "We act with honesty, transparency, and ethical behavior in all our interactions with patients and colleagues.",
      icon: "🤝"
    },
    {
      title: "Innovation",
      description: "We embrace advanced technologies and evidence-based practices to provide cutting-edge medical care.",
      icon: "💡"
    }
  ];

  const leaders = [
    {
      name: "Dr. Alexander Mitchell",
      role: "Chief Executive Officer",
      image: "/healthcare/hospital-building-new.jpg",
      description: "With over 25 years of healthcare leadership experience, Dr. Mitchell oversees the strategic direction and operations of our hospital."
    },
    {
      name: "Dr. Maria Reynolds",
      role: "Chief Medical Officer",
      image: "/healthcare/hospital-building-new.jpg",
      description: "Dr. Reynolds ensures the highest quality medical care across all departments and leads our continuous quality improvement initiatives."
    },
    {
      name: "Jennifer Parker",
      role: "Chief Nursing Officer",
      image: "/healthcare/hospital-building-new.jpg",
      description: "Jennifer leads our nursing staff, focusing on excellent patient care, professional development, and innovative nursing practices."
    }
  ];

  const achievements = [
    "Joint Commission International Accreditation for quality and patient safety",
    "Center of Excellence in Minimally Invasive Surgery",
    "Top Hospital Award for patient satisfaction 3 years running",
    "Recognized for leadership in healthcare sustainability practices",
    "Excellence in Nursing Award from the National Nursing Association"
  ];

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <Image
          src="/healthcare/hospital-building-new.jpg"
          alt="Hospital Building"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our Hospital</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Providing compassionate, high-quality healthcare for our community since 1995
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission & Vision</h2>
              <p className="text-gray-600 text-lg">
                Our mission is to improve the health and wellbeing of our community through compassionate care, 
                innovative treatments, and a commitment to excellence. We envision a future where everyone has 
                access to high-quality healthcare, delivered with dignity and respect.
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Our Story</h3>
              <p className="text-gray-700 mb-4">
                Founded in 1995, our hospital began as a small community clinic with just 15 beds and a handful of 
                dedicated physicians. Over the decades, we&#39;ve grown into a comprehensive medical center, but we&#39;ve 
                never lost sight of our founding principle: putting patients first.
              </p>
              <p className="text-gray-700">
                Through economic challenges, healthcare reforms, and even a global pandemic, we&#39;ve continuously 
                adapted and evolved to meet the changing needs of our community. Today, we&#39;re proud to offer 
                state-of-the-art facilities, advanced medical technologies, and a diverse team of healthcare 
                professionals who are leaders in their fields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              These principles guide our decision-making and shape our approach to patient care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Leadership</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Meet the dedicated professionals who guide our organization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {leaders.map((leader, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{leader.name}</h3>
                  <p className="text-purple-600 font-medium mb-3">{leader.role}</p>
                  <p className="text-gray-600">{leader.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements & Facilities */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Achievements */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Achievements & Accreditations</h2>
              <ul className="space-y-4">
                {achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 mr-3">
                      <svg className="h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Facilities */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Facilities</h2>
              <div className="space-y-6">
                <p className="text-gray-600">
                  Our hospital campus spans over 15 acres and includes state-of-the-art facilities designed with patient comfort and modern healthcare delivery in mind.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Main Hospital</h3>
                    <p className="text-gray-600 text-sm">500 beds, 25 operating theaters, and comprehensive diagnostic facilities</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Emergency Center</h3>
                    <p className="text-gray-600 text-sm">24/7 emergency care with specialized trauma units</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Outpatient Center</h3>
                    <p className="text-gray-600 text-sm">Comprehensive outpatient services in a convenient location</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Research & Education</h3>
                    <p className="text-gray-600 text-sm">Dedicated facilities for medical research and training</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Experience Our Exceptional Care</h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            We&#39;re dedicated to providing the highest quality healthcare for you and your family
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/departments" className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
              Explore Our Departments
            </Link>
            <Link href="/doctors" className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md border border-purple-500 hover:bg-purple-800 transition-colors">
              Meet Our Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 