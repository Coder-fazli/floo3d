"use client";

import HomePageHero from "@/components/HomePageHero";
import WetPaintButton from "@/components/ui/wet-paint-button";
import { BackgroundGradientGlow } from "@/components/ui/background-gradient-glow";
import HeroMarquee from "@/components/HeroMarquee";
import Navbar from "@/components/Navbar";
import { AnimatedUnderlineText } from "@/components/ui/animated-underline-text";

export default function MainHero({ heroBeforeUrl, heroAfterUrl }: { heroBeforeUrl?: string | null; heroAfterUrl?: string | null }) {
  return (
    <>
      <BackgroundGradientGlow>
        <Navbar />
        <HomePageHero
          heroBeforeUrl={heroBeforeUrl}
          heroAfterUrl={heroAfterUrl}
          headingAccent={<AnimatedUnderlineText text="Home Styler" className="text-[#EB4203]" underlineClassName="text-white" />}
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
