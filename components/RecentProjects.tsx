"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MasonryGrid } from "@/components/ui/image-testimonial-grid";

const testimonials = [
  { profileImage: "/avatars/female1.jpg", name: "Emma Wilson",   feedback: "London Loft Conversion",       mainImage: "/real-3d-render.jpg",      beforeImage: "/real-2d-plan.jpg" },
  { profileImage: "/avatars/female2.jpg", name: "Sarah Chen",    feedback: "Coastal Villa Masterpiece",    mainImage: "/hero-after.jpg",           beforeImage: "/hero-before.jpg" },
  { profileImage: "/avatars/female3.jpg", name: "Amara Okafor",  feedback: "Skyline Office Lounge",        mainImage: "/card-outdoor-after.webp",  beforeImage: "/card-outdoor-before.webp" },
  { profileImage: "/avatars/av2.jpg",     name: "James Patel",   feedback: "Modern Living Room Redesign",  mainImage: "/hiw-living.jpg",           beforeImage: "/hiw-sketch.jpg" },
  { profileImage: "/avatars/av5.jpg",     name: "Lucas Müller",  feedback: "Dark Luxury 3D Render",        mainImage: "/hiw-dark3d.jpg",           beforeImage: "/hiw-sketch2.jpg" },
  { profileImage: "/avatars/female1.jpg", name: "Priya Sharma",  feedback: "Virtual Staged Bedroom",       mainImage: "/card-room-after.webp",     beforeImage: "/card-room-before.webp" },
  { profileImage: "/avatars/av2.jpg",     name: "Omar Tariq",    feedback: "Minimalist Kitchen Render",    mainImage: "/style-minimalist.jpg",     beforeImage: "/hiw-floorplan.jpg" },
  { profileImage: "/avatars/female3.jpg", name: "Nina Rossi",    feedback: "Scandinavian Living Space",    mainImage: "/style-scandinavian.jpg",   beforeImage: "/fp-before-1.png" },
];

const TestimonialCard = ({ profileImage, name, feedback, mainImage, beforeImage }: (typeof testimonials)[0]) => (
  <div className="relative rounded-2xl overflow-hidden group transition-transform duration-300 ease-in-out hover:scale-[1.02]">
    <img src={mainImage} alt={feedback} className="w-full h-auto object-cover" />

    {/* Top gradient + user info */}
    <div className="absolute top-0 left-0 p-4 text-white hidden sm:block">
      <div className="flex items-center gap-2 mb-1">
        <img src={profileImage} className="w-7 h-7 rounded-full border border-white/60 object-cover flex-shrink-0" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }} alt={name} />
        <span className="font-bold text-sm" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>{name}</span>
      </div>
      <p className="text-xs font-medium" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>{feedback}</p>
    </div>

    {/* Before image thumbnail — bottom right corner */}
    <div style={{ position: "absolute", bottom: 0, right: 0 }}>
      <span style={{ position: "absolute", top: -14, right: 4, fontSize: "0.42rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "#EB4203", borderRadius: 9999, padding: "2px 6px", whiteSpace: "nowrap" }}>Input</span>
      <div style={{
        width: 52, height: 46,
        borderRadius: "0.75rem 0 0.75rem 0",
        border: "2px solid rgba(255,255,255,0.9)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        <img src={beforeImage} alt="Input" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff", display: "block" }} />
      </div>
    </div>
  </div>
);

export default function RecentProjects() {
  const [columns, setColumns] = React.useState(4);

  React.useEffect(() => {
    const getColumns = (w: number) => {
      if (w < 640) return 2;
      if (w < 1024) return 2;
      if (w < 1280) return 3;
      return 4;
    };
    const handle = () => setColumns(getColumns(window.innerWidth));
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "linear-gradient(to bottom, #ffffff 0%, #fdf8ec 8%, #FCEFC3 30%, #fdf8ec 70%, #f8fafc 100%)" }} id="reviews">
      {/* Dot grid */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        WebkitMaskImage: "radial-gradient(70vw circle at 50% 50%, white, transparent)",
        maskImage: "radial-gradient(70vw circle at 50% 50%, white, transparent)",
      }} />
      <div className="max-w-7xl mx-auto relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-black tracking-widest uppercase text-[#00CEC8] mb-3">
            Community Showcase
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Real Results from Real Users
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            See how architects, interior designers, and homeowners use our AI tools — from virtual staging to AI landscape design.
          </p>
        </motion.div>

        <MasonryGrid columns={columns} gap={4}>
          {testimonials.map((card, i) => (
            <TestimonialCard key={i} {...card} />
          ))}
        </MasonryGrid>

      </div>
    </section>
  );
}
