"use client";

import HomePageHero from "@/components/HomePageHero";
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
            <a href="/dashboard" className="hph-btn-cta">
              <span className="hph-btn-cta-label">Try It Free</span>
              <svg className="hph-btn-cta-arrow" width="70" height="16" viewBox="0 0 70 16">
                <line x1="0" y1="8" x2="32" y2="8" stroke="white" strokeWidth="2"/>
                <line x1="32" y1="8" x2="56" y2="8" stroke="#27282f" strokeWidth="2"/>
                <polyline points="51,4 57,8 51,12" fill="none" stroke="#27282f" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square"/>
              </svg>
            </a>
          }
        />
      </BackgroundGradientGlow>
      <HeroMarquee />
    </>
  );
}
