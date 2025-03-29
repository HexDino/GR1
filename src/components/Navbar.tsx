import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full py-4 px-6 md:px-16 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/" className="text-[#6C27FF] text-xl font-bold flex items-center">
          <span className="text-[#6C27FF] font-bold">Hospital</span>
          <span className="text-gray-600 ml-1">logo</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-8">
        <Link 
          href="/" 
          className="text-[#6C27FF] relative after:absolute after:bottom-0 after:left-0 after:bg-[#6C27FF] after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
        >
          Home
        </Link>
        <div className="relative group">
          <Link 
            href="/services" 
            className="text-gray-600 hover:text-[#6C27FF] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:bg-[#6C27FF] after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
          >
            Services
          </Link>
        </div>
        <Link 
          href="/doctors" 
          className="text-gray-600 hover:text-[#6C27FF] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:bg-[#6C27FF] after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
        >
          Doctors
        </Link>
        <Link 
          href="/about" 
          className="text-gray-600 hover:text-[#6C27FF] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:bg-[#6C27FF] after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
        >
          About us
        </Link>
        <Link 
          href="/contact" 
          className="text-gray-600 hover:text-[#6C27FF] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:bg-[#6C27FF] after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300"
        >
          Contact us
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <Link 
          href="/signin" 
          className="bg-[#6C27FF] text-white px-6 py-2 rounded-full hover:bg-[#5620CC] transition-all duration-300 hover:shadow-lg hover:shadow-[#6C27FF]/30 transform hover:-translate-y-0.5"
        >
          Sign in
        </Link>
        <Link 
          href="/signup" 
          className="text-[#6C27FF] border border-[#6C27FF] px-6 py-2 rounded-full hover:bg-[#6C27FF] hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#6C27FF]/30 transform hover:-translate-y-0.5"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
} 