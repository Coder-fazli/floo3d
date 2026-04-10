import ColorTestHero from "./ColorTestHero";
import DesignOptions from "@/components/DesignOptions";
import HowItWorks2 from "@/components/HowItWorks2";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import Blog from "@/components/Blog";
import { getHomeImages } from "@/lib/actions";
import "./color-test.css";

export const metadata = { title: "Color Test — Tropical Heat", robots: "noindex" };

export default async function ColorTestPage() {
  const homeImages = await getHomeImages();
  return (
    <div className="home color-test-root">
      <ColorTestHero heroBeforeUrl={homeImages.heroBeforeUrl} heroAfterUrl={homeImages.heroAfterUrl} />
      <DesignOptions transformImages={homeImages.transformImages} />
      <HowItWorks2 />
      <RecentProjects />
      <TestimonialsMarquee />
      <Blog />
      <FAQ />
      <Footer />
    </div>
  );
}
