import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="text-white text-xl font-bold flex items-center mb-6">
              <span className="text-[#6C27FF] font-bold">Hospital</span>
              <span className="text-white ml-1">logo</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Providing quality healthcare services with a focus on patient comfort and advanced medical treatments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 hover:bg-[#6C27FF] w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300">
                <FaFacebookF />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#6C27FF] w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300">
                <FaTwitter />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#6C27FF] w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300">
                <FaInstagram />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#6C27FF] w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 relative">
              <span className="relative z-10">Quick Links</span>
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#6C27FF]"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Services
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Our Doctors
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 relative">
              <span className="relative z-10">Our Services</span>
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#6C27FF]"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/cardiology" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Cardiology
                </Link>
              </li>
              <li>
                <Link href="/services/neurology" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Neurology
                </Link>
              </li>
              <li>
                <Link href="/services/pulmonology" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Pulmonology
                </Link>
              </li>
              <li>
                <Link href="/services/ophthalmology" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Ophthalmology
                </Link>
              </li>
              <li>
                <Link href="/services/pediatrics" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Pediatrics
                </Link>
              </li>
              <li>
                <Link href="/services/orthopedics" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Orthopedics
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 relative">
              <span className="relative z-10">Contact Information</span>
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#6C27FF]"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-[#6C27FF] mt-1 mr-3" />
                <span className="text-gray-400">123 Medical Center Drive, Healthcare City, HC 12345</span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="text-[#6C27FF] mr-3" />
                <span className="text-gray-400">+123 456 7890</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-[#6C27FF] mr-3" />
                <span className="text-gray-400">info@medicalcenter.com</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Working Hours</h4>
              <p className="text-gray-400">Monday - Friday: 8:00 AM - 8:00 PM</p>
              <p className="text-gray-400">Saturday: 9:00 AM - 6:00 PM</p>
              <p className="text-gray-400">Emergency: 24/7</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
            © 2023 Medical Center. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors duration-300">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors duration-300">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 