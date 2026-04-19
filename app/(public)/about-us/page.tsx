import { HeroBanner } from "@/components/about/hero-banner";
import { OurStory } from "@/components/about/our-story";
import { MissionVision } from "@/components/about/mission-vision";
import { ValuesGrid } from "@/components/about/values-grid";
import { LeadershipTeam } from "@/components/about/leadership-team";
import { Timeline } from "@/components/about/timeline";
import { VillageHeritage } from "@/components/about/village-heritage";
import { StatsCounter } from "@/components/landing/stats-counter";
import { CTABanner } from "@/components/landing/cta-banner";

export const metadata = {
  title: "About Us | Chandra Jyoti Sanstha",
  description:
    "Learn about the history, mission, and leadership of the Chandra Jyoti Sanstha and Tumin Dhanbari.",
};

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero with Parallax */}
      <HeroBanner />

      {/* 2. Story / Genesis Section */}
      <OurStory />

      {/* 3. Mission & Vision */}
      <MissionVision />

      {/* 4. Core Values Grid */}
      <ValuesGrid />

      {/* 5. Village Heritage Gallery */}
      <VillageHeritage />

      {/* 6. Historical Timeline */}
      <Timeline />

      {/* 7. Statistics (reusing from landing) */}
      <div className="py-12 bg-stone-50 dark:bg-stone-950 transition-colors">
        <StatsCounter />
      </div>

      {/* 8. Leadership Team */}
      <LeadershipTeam />

      {/* 9. Final CTA (reusing from landing) */}
      <CTABanner />
    </div>
  );
}
