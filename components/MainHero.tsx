"use client";

import TestHero from "@/components/TestHero";
import HeroMarquee from "@/components/HeroMarquee";
import Navbar from "@/components/Navbar";

export default function MainHero({ heroBeforeUrl, heroAfterUrl }: { heroBeforeUrl?: string | null; heroAfterUrl?: string | null }) {
  return (
    <div style={{ background: "#faf7f4" }}>
      <Navbar />
      <TestHero />
      <HeroMarquee />
    </div>
  );
}
