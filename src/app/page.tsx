import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import BenefitsSection from "@/components/BenefitsSection";
import GallerySection from "@/components/GallerySection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      <StatsSection />
      <BenefitsSection />
      <GallerySection />
      <PricingSection />
      <TestimonialsSection />
      <LocationSection />
      <Footer />
    </main>
  );
}
