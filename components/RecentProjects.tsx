"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MasonryGrid } from "@/components/ui/image-testimonial-grid";
import { useTranslations } from "next-intl";

const IMAGES = [
  { profileImage: "/avatars/female1.jpg", mainImage: "/real-3d-render.jpg",    beforeImage: "/real-2d-plan.jpg" },
  { profileImage: "/avatars/female2.jpg", mainImage: "/hero-after.jpg",        beforeImage: "/hero-before.jpg" },
  { profileImage: "/avatars/av2.jpg",     mainImage: "/hiw-living.jpg",        beforeImage: "/hiw-sketch.jpg" },
  { profileImage: "/avatars/av5.jpg",     mainImage: "/hiw-dark3d.jpg",        beforeImage: "/hiw-sketch2.jpg" },
  { profileImage: "/avatars/female1.jpg", mainImage: "/card-room-after.webp",  beforeImage: "/card-room-before.webp" },
  { profileImage: "/avatars/av2.jpg",     mainImage: "/style-minimalist.jpg",  beforeImage: "/hiw-floorplan.jpg" },
  { profileImage: "/avatars/female3.jpg", mainImage: "/style-scandinavian.jpg",beforeImage: "/fp-before-1.png" },
];

const TestimonialCard = ({ profileImage, name, feedback, mainImage, beforeImage, inputLabel }: { profileImage: string; name: string; feedback: string; mainImage: string; beforeImage: string; inputLabel: string }) => (
  <div className="relative rounded-2xl overflow-hidden group transition-transform duration-300 ease-in-out hover:scale-[1.02]">
    <img src={mainImage} alt={feedback} className="w-full h-auto object-cover" />
    <div className="absolute top-0 left-0 p-3 text-white">
      <div className="flex items-center gap-2 mb-1">
        <img src={profileImage} className="w-7 h-7 rounded-full border border-white/60 object-cover flex-shrink-0" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }} alt={name} />
        <span className="font-bold text-sm hidden sm:inline" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>{name}</span>
      </div>
      <p className="text-xs font-medium hidden sm:block" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>{feedback}</p>
    </div>
    <div style={{ position: "absolute", bottom: 0, right: 0 }}>
      <span style={{ position: "absolute", top: -14, right: 4, fontSize: "0.42rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "var(--brand-color)", borderRadius: 9999, padding: "2px 6px", whiteSpace: "nowrap" }}>{inputLabel}</span>
      <div style={{ width: 52, height: 46, borderRadius: "0.75rem 0 0.75rem 0", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 12px rgba(0,0,0,0.25)", overflow: "hidden" }}>
        <img src={beforeImage} alt={inputLabel} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff", display: "block" }} />
      </div>
    </div>
  </div>
);

export default function RecentProjects() {
  const t = useTranslations("gallery");
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
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "#faf7f4" }} id="reviews">
      <div className="max-w-7xl mx-auto relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: "var(--brand-color)" }}>{t("eyebrow")}</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: "#27282f", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            {t("title")}
          </h2>
          <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#64748b" }}>{t("sub")}</p>
        </motion.div>

        <MasonryGrid columns={columns} gap={4}>
          {IMAGES.map((img, i) => (
            <TestimonialCard
              key={i}
              {...img}
              name={t(`item${i + 1}Name` as any)}
              feedback={t(`item${i + 1}Label` as any)}
              inputLabel={t("input")}
            />
          ))}
        </MasonryGrid>

      </div>
    </section>
  );
}
