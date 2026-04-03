import Image from "next/image";
import Navbar from "@/components/Navbar";
import HomePageHero from "@/components/HomePageHero";
import DesignOptions from "@/components/DesignOptions";
import HowItWorks2 from "@/components/HowItWorks2";
import Blog from "@/components/Blog";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { Marquee } from "@/components/ui/marquee";
import { getHomeImages } from "@/lib/actions";
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
      "name": "MyHomeStyler — AI Interior Design & Floor Plan Tool",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "url": "https://myhomestyler.com",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free to start — no credit card required",
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
      "description": "AI-powered interior design and floor plan visualization tool. Transform 2D floor plans into photorealistic 3D renders instantly.",
      "screenshot": "https://myhomestyler.com/og-image.png",
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is MyHomeStyler?",
          "acceptedAnswer": { "@type": "Answer", "text": "MyHomeStyler is an AI-powered tool that transforms 2D floor plans and interior photos into photorealistic 3D renders instantly. It supports multiple design styles including Modern, Scandinavian, Industrial, Rustic, Luxury, and Minimalist." },
        },
        {
          "@type": "Question",
          "name": "Is MyHomeStyler free to use?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can start for free with no credit card required. Free users get credits to try the tool immediately after signing up." },
        },
        {
          "@type": "Question",
          "name": "What can I do with MyHomeStyler?",
          "acceptedAnswer": { "@type": "Answer", "text": "You can convert 2D floor plans to 3D renders, redesign interior rooms, visualize outdoor spaces, and empty rooms. The AI generates photorealistic results in seconds." },
        },
        {
          "@type": "Question",
          "name": "How long does it take to generate a render?",
          "acceptedAnswer": { "@type": "Answer", "text": "Most renders are generated in 15–30 seconds. You'll see a live progress indicator while the AI is working." },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myhomestyler.com" },
      ],
    },
  ],
};

export default async function Home() {
  const homeImages = await getHomeImages();
  return (
    <div className="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <HomePageHero heroBeforeUrl={homeImages.heroBeforeUrl} heroAfterUrl={homeImages.heroAfterUrl} />

      <DesignOptions transformImages={homeImages.transformImages} />

      <HowItWorks2 />

      <RecentProjects />

      <section className="marquee-section" id="reviews">
        <div className="marquee-header">
          <span className="marquee-eyebrow">Real Stories</span>
          <h2 className="marquee-title">
            Loved by <em className="marquee-accent">Thousands</em> of Professionals
          </h2>
          <p className="marquee-subtitle">Architects, interior designers, real estate agents, and homeowners — all transforming spaces with MyHomeStyler.</p>
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

      <Blog />

      <FAQ />

      <Footer />
    </div>
  );
}
