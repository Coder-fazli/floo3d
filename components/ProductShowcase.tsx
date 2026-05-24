"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

const FEATURES = [
  { icon: "⚡", label: "Renders in 30 seconds" },
  { icon: "🎨", label: "20+ design styles" },
  { icon: "📐", label: "Any 2D floor plan" },
  { icon: "📤", label: "Export HD PNG / JPG / PDF" },
];

export default function ProductShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ background: "#fdfbf7", padding: "80px 24px 80px", overflow: "hidden" }}>
      <div
        ref={ref}
        style={{
          maxWidth: 920,
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(36px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Eyebrow */}
        <p style={{ color: "#ec5b13", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
          See it in action
        </p>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            color: "#1a1a1a",
            fontSize: "clamp(1.75rem, 4.5vw, 2.85rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          From 2D sketch to photorealistic 3D —{" "}
          <span style={{ color: "#ec5b13", fontStyle: "italic" }}>in seconds</span>
        </h2>

        <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 52px" }}>
          Upload any floor plan, pick a design style, and watch the AI do its thing.
          No software. No learning curve.
        </p>

        {/* Image card */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            width: "100%",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {/* top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, transparent 0%, #ec5b13 40%, #fb923c 60%, transparent 100%)",
              zIndex: 2,
            }}
          />
          <Image
            src="/product-showcase-v3.png"
            alt="MyHomeStyler — 2D floor plan to 3D render workflow"
            width={1280}
            height={720}
            priority
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 40 }}>
          {FEATURES.map((f, i) => (
            <span
              key={f.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#374151",
                borderRadius: 100,
                padding: "8px 18px",
                fontSize: "0.84rem",
                fontWeight: 500,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(14px)",
                transition: `opacity 0.5s ease ${0.3 + i * 0.09}s, transform 0.5s ease ${0.3 + i * 0.09}s`,
              }}
            >
              <span>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
