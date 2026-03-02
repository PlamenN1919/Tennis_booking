import Navbar from "@/components/Navbar";
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
      <Navbar />
      <HeroSection />
      <StatsSection />
      <BenefitsSection />
      <GallerySection />
      {/* Shared hero-style background for Pricing + Testimonials */}
      <div className="relative overflow-hidden">
        {/* Animated moving background gradient */}
        <div
          className="absolute inset-0 animate-[gradientShift_12s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(ellipse 85% 75% at 30% 50%, #331c10 0%, #21120a 32%, #150d07 58%, #0d0b08 100%)",
            backgroundSize: "200% 200%",
          }}
        />
        {/* Animated gradient orbs */}
        <div
          className="absolute w-[650px] h-[650px] rounded-full opacity-[0.12] blur-[120px] animate-[float_18s_ease-in-out_infinite]"
          style={{
            background: "radial-gradient(circle, #5c3a2a, transparent 70%)",
            top: "8%",
            left: "2%",
          }}
        />
        <div
          className="absolute w-[550px] h-[550px] rounded-full opacity-[0.09] blur-[100px] animate-[float_22s_ease-in-out_infinite_reverse]"
          style={{
            background: "radial-gradient(circle, #4e2e1c, transparent 70%)",
            bottom: "2%",
            right: "8%",
          }}
        />
        <div
          className="absolute w-[450px] h-[450px] rounded-full opacity-[0.07] blur-[90px] animate-[float_15s_ease-in-out_infinite_2s]"
          style={{
            background: "radial-gradient(circle, #402418, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
        <PricingSection />
        <TestimonialsSection />
      </div>
      <LocationSection />
      <Footer />
    </main>
  );
}
