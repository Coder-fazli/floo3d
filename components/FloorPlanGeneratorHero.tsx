"use client";

import "./HomePageHero.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage } from "react-compare-slider";
import { useClerk, useUser } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";

const features = [
  {
    title: "AI Floor Plan Generator",
    desc: "Pick your property type, area, floors, and rooms — our AI floor plan generator creates a professional layout in seconds. No design skills needed.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/>
        <path d="M12 4v16M4 12h16"/>
      </svg>
    ),
  },
  {
    title: "AI Blueprint Generator",
    desc: "Generate architectural-grade blueprints, colored room plans, or isometric 3D-style views. Our AI blueprint generator handles any property type.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
      </svg>
    ),
  },
  {
    title: "Generate Floor Plan Free",
    desc: "Create unlimited floor plan variations — house, apartment, villa, studio, or office. Free to start, no credit card, no software installation required.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    title: "Convert to 3D Instantly",
    desc: "Once your AI-generated floor plan is ready, convert it to a photorealistic 3D render in one click — no extra uploads, no extra tools.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
];

export default function FloorPlanGeneratorHero({
  heroBeforeUrl = "/real-2d-plan.jpg",
  heroAfterUrl  = "/real-3d-render.jpg",
}: {
  heroBeforeUrl?: string;
  heroAfterUrl?: string;
}) {
  const { isSignedIn } = useUser();
  const { openSignUp } = useClerk();
  const [sliderPos, setSliderPos] = useState(40);
  const rafRef = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    let fromPos = 40, toPos = 75, segStart = 0, segDuration = 1200;

    const pickNext = (cur: number) => {
      const min = 10, max = 88;
      const next = cur < 50
        ? Math.round(58 + Math.random() * 30)
        : Math.round(min + Math.random() * 32);
      return Math.max(min, Math.min(max, next));
    };

    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const loop = (now: number) => {
      if (isDragging.current) { segStart = now; rafRef.current = requestAnimationFrame(loop); return; }
      if (segStart === 0) segStart = now;
      const progress = Math.min((now - segStart) / segDuration, 1);
      setSliderPos(Math.round(fromPos + ease(progress) * (toPos - fromPos)));
      if (progress >= 1) {
        fromPos = toPos;
        toPos = pickNext(fromPos);
        segDuration = 900 + Math.random() * 600;
        segStart = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    const t = setTimeout(() => { segStart = 0; rafRef.current = requestAnimationFrame(loop); }, 400);
    return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <section className="hph-section">

      {/* Ambient blobs */}
      <div className="hph-blob-orange" />
      <div className="hph-blob-blue" />

      {/* Main grid */}
      <div className="hph-grid">

        {/* ── Left: Content ── */}
        <div className="hph-content">

          {/* Live badge */}
          <div className="hph-badge">
            <span className="hph-badge-dot-wrap">
              <span className="hph-badge-ping" />
              <span className="hph-badge-dot" />
            </span>
            <span className="hph-badge-text">AI Floor Plan Generator Free · No Login Required</span>
          </div>

          {/* Heading */}
          <h1 className="hph-heading">
            AI Floor Plan<br />
            <span className="hph-heading-accent">Generator</span><br />
            Free. Online. Instant.
          </h1>

          {/* Sub */}
          <p className="hph-sub">
            Generate any floor plan from scratch with AI — no design skills, no software, no credit card. Configure your rooms, pick a style, and get a professional floor plan in seconds.
          </p>

          {/* CTAs */}
          <div className="hph-btns">
            <a href="#generator" className="hph-btn-primary">Generate Free</a>
            <Link href="#how-it-works" className="hph-btn-secondary">See How It Works</Link>
          </div>

          {/* Trusted users */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginTop: "0.25rem" }}>
            {/* Avatars */}
            <div style={{ display: "flex" }}>
              {["/avatars/female1.jpg", "/avatars/female3.jpg", "/avatars/av2.jpg", "/avatars/female2.jpg", "/avatars/av5.jpg"].map((src, i) => (
                <div key={i} style={{
                  width: 38, height: 38, borderRadius: "9999px", overflow: "hidden",
                  border: "2px solid #ffffff",
                  marginLeft: i === 0 ? 0 : -10,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                  position: "relative", zIndex: 5 - i,
                }}>
                  <Image src={src} alt="user" width={38} height={38} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                </div>
              ))}
            </div>
            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} fill="#ec5b13" stroke="none" />
                ))}
              </div>
              <p style={{ fontSize: "0.78rem", color: "#475569", margin: 0, fontWeight: 500 }}>
                Trusted by{" "}
                <CountUp value={2500} duration={2} separator="," suffix="+" colorScheme="gradient" className="font-bold" />
                {" "}architects &{" "}
                <a href="#reviews" style={{ color: "#ec5b13", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "2px" }}>
                  happy users
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Slider ── */}
        <div className="hph-slider-wrap">
          <div className="hph-slider-glow" />

          <div className="hph-slider-container">
            <ReactCompareSlider
              position={sliderPos}
              onPositionChange={setSliderPos}
              onPointerDown={() => { isDragging.current = true; }}
              onPointerUp={() => { isDragging.current = false; }}
              onPointerLeave={() => { isDragging.current = false; }}
              onMouseEnter={() => { isDragging.current = true; }}
              onMouseLeave={() => { isDragging.current = false; }}
              style={{ width: "100%", height: "100%" }}
              handle={
                <ReactCompareSliderHandle
                  buttonStyle={{
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid #ffffff",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                    color: "#ec5b13",
                    width: "3.5rem",
                    height: "3.5rem",
                  }}
                  linesStyle={{ background: "rgba(255,255,255,0.3)", width: 1 }}
                />
              }
              itemOne={<ReactCompareSliderImage src={heroBeforeUrl} alt="2D Floor Plan Configuration" style={{ objectFit: "cover" }} />}
              itemTwo={<ReactCompareSliderImage src={heroAfterUrl} alt="AI Generated Floor Plan" style={{ objectFit: "cover" }} />}
            />

            {/* Labels */}
            <span style={{ position:"absolute", top:24, left:24, zIndex:20, padding:"8px 16px", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:"0.65rem", letterSpacing:"0.15em", borderRadius:100, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none", textTransform:"uppercase" }}>
              Before: Blueprint
            </span>
            <span style={{ position:"absolute", top:24, right:24, zIndex:20, padding:"8px 16px", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:"0.65rem", letterSpacing:"0.15em", borderRadius:100, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none", textTransform:"uppercase" }}>
              After: AI Render
            </span>
          </div>

          {/* Floating glass card */}
          <div className="hph-float-card">
            <div className="hph-float-row">
              <div className="hph-float-icon">
                <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="hph-float-label">Floor Plan Generated</span>
            </div>
            <div className="hph-float-bar-bg">
              <div className="hph-float-bar-fill" />
            </div>
            <p className="hph-float-sub">AI processed your layout in 1.8s</p>
          </div>
        </div>

      </div>

      {/* ── Feature cards ── */}
      <div className="hph-features">
        {features.map((f) => (
          <a href="#generator" key={f.title} className="hph-feat-card">
            <div className="hph-feat-icon">{f.icon}</div>
            <h3 className="hph-feat-title">{f.title}</h3>
            <p className="hph-feat-desc">{f.desc}</p>
          </a>
        ))}
      </div>

    </section>
  );
}
