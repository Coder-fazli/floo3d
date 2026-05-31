import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import FloorPlanGeneratorHero from "@/components/FloorPlanGeneratorHero";
import HowItWorks2 from "@/components/HowItWorks2";
import DesignOptions from "@/components/DesignOptions";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import FaqServer from "@/components/FaqServer";
import "@/components/FAQ.css";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import { getSiteSettings, getFpgImages } from "@/lib/actions";

const DEFAULT_TITLE = "AI Floor Plan Generator — Create Custom Floor Plans Free Online";
const DEFAULT_DESC = "Generate a custom 2D floor plan from scratch using AI. Choose your rooms, size, and style — get a professional floor plan in seconds. Free to start.";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s?.floorPlanGeneratorMetaTitle || DEFAULT_TITLE;
  const description = s?.floorPlanGeneratorMetaDescription || DEFAULT_DESC;
  return {
    title,
    description,
    alternates: {
      canonical: "https://myhomestyler.com/floor-plan-generator",
      languages: {
        en: "https://myhomestyler.com/floor-plan-generator",
        "ar-AE": "https://myhomestyler.com/ar/floor-plan-generator",
        "x-default": "https://myhomestyler.com/floor-plan-generator",
      },
    },
    openGraph: {
      title,
      description,
      images: [{ url: "/og-floor-plan-generator.jpg", width: 1200, height: 630 }],
    },
  };
}


const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "MyHomeStyler AI Floor Plan Generator",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "url": "https://myhomestyler.com/floor-plan-generator",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free to start — no credit card required",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1840",
        "bestRating": "5",
        "worstRating": "1",
      },
      "review": [
        { "@type": "Review", "author": { "@type": "Person", "name": "Sarah Mitchell" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "reviewBody": "I upload a floor plan and get a photorealistic 3D render in seconds. MyHomeStyler completely replaced our old rendering pipeline." },
        { "@type": "Review", "author": { "@type": "Person", "name": "James Okafor" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "reviewBody": "We use it for every listing now. Buyers can visualize the space in different styles without visiting." },
        { "@type": "Review", "author": { "@type": "Person", "name": "Carlos Rivera" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "reviewBody": "The blueprint-to-3D conversion is shockingly accurate. I use it to quickly show clients what their space will look like." },
        { "@type": "Review", "author": { "@type": "Person", "name": "Priya Kapoor" }, "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }, "reviewBody": "I generated a full apartment floor plan in under a minute just by describing the rooms. No design software needed at all." },
      ],
      "description": DEFAULT_DESC,
      "screenshot": "https://myhomestyler.com/og-floor-plan-generator.jpg",
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is the AI floor plan generator free to use?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes — our AI floor plan generator free tool lets you create professional floor plans without a credit card. New accounts receive free credits instantly so you can start generating right away." },
        },
        {
          "@type": "Question",
          "name": "What is an AI floor plan generator?",
          "acceptedAnswer": { "@type": "Answer", "text": "An AI floor plan generator is a tool that automatically creates architectural floor plans based on your inputs — property type, room count, size, and style. Instead of drawing manually, the AI blueprint generator handles the layout and design for you in seconds." },
        },
        {
          "@type": "Question",
          "name": "What can the AI blueprint generator create?",
          "acceptedAnswer": { "@type": "Answer", "text": "The AI blueprint generator can produce three types of floor plans: black and white architectural blueprints, soft colored room plans with furniture icons, and isometric 3D-style views. It works for houses, apartments, villas, studios, and offices." },
        },
        {
          "@type": "Question",
          "name": "Can I convert the AI-generated floor plan to a 3D render?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. After the AI floor plan generator creates your plan, click Convert to 3D to open it in the visualizer and generate a photorealistic 3D render from it — no extra uploads needed." },
        },
        {
          "@type": "Question",
          "name": "How long does the AI floor plan generator take?",
          "acceptedAnswer": { "@type": "Answer", "text": "Most results from the AI floor plan generator are ready in 15–30 seconds. You will see a live loading indicator while the AI is working on your layout." },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://myhomestyler.com" },
        { "@type": "ListItem", "position": 2, "name": "AI Floor Plan Generator", "item": "https://myhomestyler.com/floor-plan-generator" },
      ],
    },
  ],
};

export default async function FloorPlanGeneratorPage() {
  const fpgImages = await getFpgImages();
  return (
    <div className="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <FloorPlanGeneratorHero
        heroBeforeUrl={fpgImages.heroBeforeUrl ?? undefined}
        heroAfterUrl={fpgImages.heroAfterUrl ?? undefined}
      />

      <HowItWorks2 />

      <DesignOptions />

      <RecentProjects />

      <TestimonialsMarquee />

      <FaqServer twoColumns faqs={[
        { q: "Is the AI floor plan generator free to use?", a: "Yes — our AI floor plan generator free tool lets you create professional floor plans without a credit card. New accounts receive free credits instantly so you can start generating right away." },
        { q: "What is an AI floor plan generator?", a: "An AI floor plan generator is a tool that automatically creates architectural floor plans based on your inputs — property type, room count, size, and style. Instead of drawing manually, the AI blueprint generator handles the layout and design for you in seconds." },
        { q: "What can the AI blueprint generator create?", a: "The AI blueprint generator can produce three types of floor plans: black and white architectural blueprints, soft colored room plans with furniture icons, and isometric 3D-style views. It works for houses, apartments, villas, studios, and offices." },
        { q: "How accurate is the AI floor plan generator?", a: "The AI floor plan generator produces professional-quality layouts based on your room configuration and area. While it is not a substitute for licensed architectural drawings, it is ideal for planning, client presentations, and renovation visualization." },
        { q: "How long does the AI floor plan generator take?", a: "Most results from the AI floor plan generator are ready in 15–30 seconds. You will see a live loading indicator while the AI is working on your layout." },
        { q: "Can I convert the AI-generated floor plan to a 3D render?", a: "Yes. After the AI floor plan generator creates your plan, click Convert to 3D to open it in the visualizer and generate a photorealistic 3D render from it — no extra uploads needed." },
        { q: "What property types does the AI blueprint generator support?", a: "The AI blueprint generator supports House, Apartment, Villa, Studio, and Office. Each property type affects how the AI distributes rooms and spaces across the floor plan." },
        { q: "Do I need to sign up to generate a floor plan?", a: "You need a free account to generate floor plans. Signing up takes under a minute and gives you free credits immediately — no credit card required." },
        { q: "How many rooms can I add?", a: "You can add bedrooms, bathrooms, kitchen, living room, dining room, and office. You can also include extras like garage, balcony, terrace, and garden area. Each room is added using a simple stepper — just increase the count." },
        { q: "Can I set the exact size of my floor plan?", a: "Yes. You can enter the total area in either square meters (m²) or square feet (sqft) and set the number of floors. The AI uses this to scale the layout proportionally." },
        { q: "What is the difference between Blueprint, Colored, and Isometric styles?", a: "Blueprint is a clean black and white architectural drawing with room labels and standard symbols — ideal for professional use. Colored fills each room with a distinct soft color and shows furniture as flat icons — great for visual planning. Isometric shows the floor plan from a corner angle in a 3D perspective with photorealistic furniture." },
        { q: "Can I use the generated floor plan for construction?", a: "The AI-generated floor plan is intended for visualization, planning, and presentation purposes. It is not a certified architectural drawing and should not be used as a substitute for official blueprints produced by a licensed architect." },
        { q: "Can I download the generated floor plan?", a: "Yes. Once your floor plan is generated, you can download it as a PNG image directly from the result panel. Signed-in users can also access it later from their project dashboard." },
        { q: "What happens if I am not happy with the result?", a: "You can adjust your room configuration or style and regenerate. Each generation uses credits, so you can try multiple variations until you get the layout you want." },
        { q: "Is there a limit on how many floor plans I can generate?", a: "Your free credits cover a set number of generations. Once used, you can purchase additional credits to keep generating. There is no subscription — you only pay for what you use." },
        { q: "Can I generate a multi-floor house plan?", a: "Yes. You can set the number of floors up to 5. The AI takes the floor count into account when generating the layout and distributing rooms across levels." },
        { q: "Does it work on mobile?", a: "Yes. The AI floor plan generator is fully responsive and works on any device — phone, tablet, or desktop. No app download needed." },
      ]} />


      <Footer />
    </div>
  );
}
