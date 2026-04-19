"use client";

import HomePageHero from "@/components/HomePageHero";
import WetPaintButton from "@/components/ui/wet-paint-button";
import { BackgroundGradientGlow } from "@/components/ui/background-gradient-glow";
import HeroMarquee from "@/components/HeroMarquee";
import Navbar from "@/components/Navbar";

export default function MainHero({ heroBeforeUrl, heroAfterUrl }: { heroBeforeUrl?: string | null; heroAfterUrl?: string | null }) {
  return (
    <>
      <BackgroundGradientGlow>
        <Navbar />
        <HomePageHero
          heroBeforeUrl={heroBeforeUrl}
          heroAfterUrl={heroAfterUrl}
          headingAccent={<span style={{ color: "var(--brand-color)" }}>Home Styler</span>}
          ctaOverride={
            <a href="/dashboard">
              <WetPaintButton>Try It Free</WetPaintButton>
            </a>
          }
        />
      </BackgroundGradientGlow>
      <HeroMarquee />
    </>
  );
}
