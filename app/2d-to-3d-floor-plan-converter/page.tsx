import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import FloorPlanHero from "@/components/FloorPlanHero";
import DesignOptions from "@/components/DesignOptions";
import HowItWorks2 from "@/components/HowItWorks2";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { Marquee } from "@/components/ui/marquee";
import { getSiteSettings } from "@/lib/actions";

const DEFAULT_TITLE = "2D to 3D Floor Plan Converter — Convert 2D Floor Plan to 3D Model Free Online";
const DEFAULT_DESC = "Convert 2D floor plans to 3D models free online — no credit card, no login required. Works with blueprints, house plans & hand-drawn sketches. Results in seconds.";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s?.floorPlanMetaTitle || DEFAULT_TITLE;
  const description = s?.floorPlanMetaDescription || DEFAULT_DESC;
  return {
    title,
    description,
    alternates: { canonical: "/2d-to-3d-floor-plan-converter" },
    openGraph: {
      title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

const reviews = [
  { name: "David M.", handle: "@davidm", avatar: "/avatars/av1.jpg", text: "I rendered my entire apartment floor plan in under 2 minutes. The 3D output is stunning, clients love it." },
  { name: "Jessica K.", handle: "@jessicak", avatar: "/avatars/av2.jpg", text: "As an architect, this saves me hours. The AI understands spatial layout better than I expected." },
  { name: "Sophie R.", handle: "@sophier", avatar: "/avatars/av3.jpg", text: "Used it for my renovation project. Before and after comparison slider is a killer feature." },
  { name: "Omar T.", handle: "@omart", avatar: "/avatars/av4.jpg", text: "Finally a tool that makes floor plans look like real renders. My agency uses this daily now." },
  { name: "Priya S.", handle: "@priyas", avatar: "/avatars/av5.jpg", text: "Super fast, super clean. I shared the link with my client and they approved the design instantly." },
  { name: "Chris L.", handle: "@chrisl", avatar: "/avatars/av6.jpg", text: "The quality blew me away. Looks like a proper architectural visualization tool but way simpler." },
  { name: "Marcus F.", handle: "@marcusf", avatar: "/avatars/av7.jpg", text: "I'm not even a designer and I managed to get a beautiful 3D render from my hand-drawn sketch." },
  { name: "Dev P.", handle: "@devp", avatar: "/avatars/av8.jpg", text: "Best AI tool I've used this year. The export quality is perfect for client presentations." },
];

export default function FloorPlanConverterPage() {
  return (
    <div className="home">
      <Navbar />

      <FloorPlanHero />

      <DesignOptions />

      <HowItWorks2 />

      <RecentProjects />

      <section className="marquee-section" id="reviews">
        <div className="marquee-header">
          <span className="marquee-eyebrow">Real Stories</span>
          <h2 className="marquee-title">
            Loved by <em className="marquee-accent">Thousands</em> of Professionals
          </h2>
          <p className="marquee-subtitle">Architects, interior designers, real estate agents, and homeowners — all converting 2D floor plans to 3D models free online with MyHomeStyler.</p>
        </div>
        <Marquee pauseOnHover repeat={3} className="marquee-strip">
          {reviews.slice(0, 4).map((r) => (
            <div key={r.handle} className="review-card">
              <div className="review-header">
                <Image src={r.avatar} alt={r.name} className="review-avatar" width={40} height={40} />
                <div>
                  <p className="review-name">{r.name}</p>
                  <p className="review-handle">{r.handle}</p>
                </div>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover repeat={3} className="marquee-strip">
          {reviews.slice(4).map((r) => (
            <div key={r.handle} className="review-card">
              <div className="review-header">
                <Image src={r.avatar} alt={r.name} className="review-avatar" width={40} height={40} />
                <div>
                  <p className="review-name">{r.name}</p>
                  <p className="review-handle">{r.handle}</p>
                </div>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </Marquee>
      </section>

      <FAQ />

      <Footer />
    </div>
  );
}
