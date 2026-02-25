import { HeroSection } from "@/components/landing/hero-section";
import { VillageSection } from "@/components/landing/village-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsCounter } from "@/components/landing/stats-counter";
import { SansthaSection } from "@/components/landing/sanstha-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTABanner } from "@/components/landing/cta-banner";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <VillageSection />
      <FeaturesSection />
      <StatsCounter />
      <SansthaSection />
      <TestimonialsSection />
      <CTABanner />
    </div>
  );
}
