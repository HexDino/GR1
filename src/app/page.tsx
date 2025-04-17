import { HeroSection } from "@/components/HeroSection";
import { DepartmentSection } from "@/components/DepartmentSection";
import { DoctorSection } from "@/components/DoctorSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { HospitalIntroSection } from "@/components/HospitalIntroSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <DepartmentSection />
      <DoctorSection />
      <TestimonialSection />
      <HospitalIntroSection />
    </main>
  );
} 