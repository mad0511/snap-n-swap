import { HeroSection } from "@/components/landing/hero-section";
import { ScrollZoomSection } from "@/components/landing/scroll-zoom-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ParallaxShowcase } from "@/components/landing/parallax-showcase";
import { FeaturedItems } from "@/components/landing/featured-items";
import { TextRevealSection } from "@/components/landing/text-reveal-section";
import { CtaBanner } from "@/components/landing/cta-banner";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <HeroSection />
      <ScrollZoomSection />
      <HowItWorks />
      <ParallaxShowcase />
      <FeaturedItems />
      <TextRevealSection />
      <CtaBanner />
    </main>
  );
}
