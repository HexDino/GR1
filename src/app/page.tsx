import { HeroSection } from "@/components/HeroSection";
import { ServiceSection } from "@/components/ServiceSection";
import { DoctorSection } from "@/components/DoctorSection";
import { TestimonialSection } from "@/components/TestimonialSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ServiceSection />
      <DoctorSection />
      <TestimonialSection />
    </main>
  );
} 