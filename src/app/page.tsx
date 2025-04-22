import { HeroSection } from "@/components/HeroSection";
import { DepartmentSection } from "@/components/DepartmentSection";
import { DoctorSection } from "@/components/DoctorSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { HospitalIntroSection } from "@/components/HospitalIntroSection";
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <DepartmentSection />
        <DoctorSection />
        <TestimonialSection />
        <HospitalIntroSection />
      </main>
    </>
  );
} 