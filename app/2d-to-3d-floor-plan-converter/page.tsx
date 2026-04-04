import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import FloorPlanHero from "@/components/FloorPlanHero";
import DesignOptions from "@/components/DesignOptions";
import HowItWorks2 from "@/components/HowItWorks2";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import VisualizerClient from "@/app/visualizer/[id]/VisualizerClient";
import FAQ from "@/components/FAQ";
import { Marquee } from "@/components/ui/marquee";
import { getSiteSettings, getAppFrames } from "@/lib/actions";

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
      images: [{ url: "/og-2d-to-3d-floor-plan.jpg", width: 1200, height: 630 }],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "MyHomeStyler 2D to 3D Floor Plan Converter",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "url": "https://myhomestyler.com/2d-to-3d-floor-plan-converter",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "6 free conversions — no credit card required",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "2547",
        "bestRating": "5",
        "worstRating": "1",
      },
      "review": reviews.map((r) => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": r.name },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": r.text,
      })),
      "description": DEFAULT_DESC,
      "screenshot": "https://myhomestyler.com/og-2d-to-3d-floor-plan.jpg",
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do I need to sign up or create an account?",
          "acceptedAnswer": { "@type": "Answer", "text": "No. You can convert your first floor plans completely free without signing up. You get 6 free generations right here on the page — no account, no email, nothing. Sign up only when you want more." },
        },
        {
          "@type": "Question",
          "name": "Is it really free? Do you need a credit card?",
          "acceptedAnswer": { "@type": "Answer", "text": "100% free to start — no credit card required, ever. We don't ask for payment details to try the tool. You get 6 free generations as a guest. Sign up free and get 10 more credits instantly, still no credit card needed." },
        },
        {
          "@type": "Question",
          "name": "How many free conversions do I get?",
          "acceptedAnswer": { "@type": "Answer", "text": "As a guest you get 6 free 2D to 3D conversions right on this page. Create a free account and get 10 more credits added to your balance immediately. No credit card, no subscription required." },
        },
        {
          "@type": "Question",
          "name": "What types of floor plans does it accept?",
          "acceptedAnswer": { "@type": "Answer", "text": "It works with any 2D floor plan image — hand-drawn sketches, scanned blueprints, CAD exports (PNG/JPG), architectural drawings, or any 2D house plan image. As long as it's a PNG or JPG under 10MB, the AI can process it." },
        },
        {
          "@type": "Question",
          "name": "How long does the 3D conversion take?",
          "acceptedAnswer": { "@type": "Answer", "text": "Most 2D floor plans are converted to a 3D render in 15–30 seconds. Complex plans with many rooms may take up to 60 seconds. You'll see a live progress indicator while the AI is working." },
        },
        {
          "@type": "Question",
          "name": "Can I download the 3D render?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. Once your 3D render is ready, click the Download button to save it as a high-resolution PNG. Signed-in users get access to Ultra HD downloads and can save all renders to their project dashboard." },
        },
        {
          "@type": "Question",
          "name": "What design styles are available?",
          "acceptedAnswer": { "@type": "Answer", "text": "You can choose from 6 styles: Modern, Scandinavian, Industrial, Rustic, Luxury, and Minimalist. Each style applies different materials, furniture, lighting, and finishes to your floor plan render." },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myhomestyler.com" },
        { "@type": "ListItem", "position": 2, "name": "2D to 3D Floor Plan Converter", "item": "https://myhomestyler.com/2d-to-3d-floor-plan-converter" },
      ],
    },
  ],
};

export default async function FloorPlanConverterPage() {
  const frames = await getAppFrames();
  return (
    <div className="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <FloorPlanHero />

      <HowItWorks2 />

      <section id="try-converter">
        <Suspense><VisualizerClient embeddedId="new" frames={frames} /></Suspense>
      </section>

      <DesignOptions />

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

      <FAQ faqs={[
        {
          q: "Do I need to sign up or create an account?",
          a: "No. You can convert your first floor plans completely free without signing up. You get 6 free generations right here on the page — no account, no email, nothing. Sign up only when you want more.",
        },
        {
          q: "Is it really free? Do you need a credit card?",
          a: "100% free to start — no credit card required, ever. We don't ask for payment details to try the tool. You get 6 free generations as a guest. Sign up free and get 10 more credits instantly, still no credit card needed.",
        },
        {
          q: "How many free conversions do I get?",
          a: "As a guest you get 6 free 2D to 3D conversions right on this page. Create a free account and get 10 more credits added to your balance immediately. No credit card, no subscription required.",
        },
        {
          q: "What happens when I run out of free credits?",
          a: "When your free credits run out you'll see a prompt to sign up. Creating a free account gives you 10 fresh credits instantly. After that, you can purchase more credit packs — still no subscription, pay only for what you use.",
        },
        {
          q: "What types of floor plans does it accept?",
          a: "It works with any 2D floor plan image — hand-drawn sketches, scanned blueprints, CAD exports (PNG/JPG), architectural drawings, or any 2D house plan image. As long as it's a PNG or JPG under 10MB, the AI can process it.",
        },
        {
          q: "How long does the 3D conversion take?",
          a: "Most 2D floor plans are converted to a 3D render in 15–30 seconds. Complex plans with many rooms may take up to 60 seconds. You'll see a live progress indicator while the AI is working.",
        },
        {
          q: "Can I download the 3D render?",
          a: "Yes. Once your 3D render is ready, click the Download button to save it as a high-resolution PNG. Signed-in users get access to Ultra HD downloads and can save all renders to their project dashboard.",
        },
        {
          q: "What design styles are available?",
          a: "You can choose from 6 styles: Modern, Scandinavian, Industrial, Rustic, Luxury, and Minimalist. Each style applies different materials, furniture, lighting, and finishes to your floor plan render.",
        },
      ]} />

      <Footer />
    </div>
  );
}
