"use client";

import "./HomePageHero.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage } from "react-compare-slider";

const features = [
  {
    title: "2D Floor Plans",
    desc: "Turn rough architectural sketches into high-fidelity 3D layouts with precision.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/>
        <path d="M12 4v16M4 12h16"/>
      </svg>
    ),
  },
  {
    title: "Room Style Transfer",
    desc: "Swap aesthetics, materials, and luxury furniture instantly in any captured space.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    title: "Empty the Room",
    desc: "Clear any space instantly — perfect for planning fresh layouts and new ideas.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    title: "Outdoor & Garden",
    desc: "Capture environmental lighting for stunning, realistic outdoor architectural photography.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
      </svg>
    ),
  },
];

export default function HomePageHero() {
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
            <span className="hph-badge-text">Unified AI Visualization Platform</span>
          </div>

          {/* Heading */}
          <h1 className="hph-heading">
            Architectural<br />
            <span className="hph-heading-accent">Visualization</span><br />
            for Every Space.
          </h1>

          {/* Sub */}
          <p className="hph-sub">
            From basic 2D blueprints to hyper-realistic designer interiors. Floo3D transforms architectural concepts into professional assets instantly.
          </p>

          {/* CTAs */}
          <div className="hph-btns">
            <Link href="/dashboard" className="hph-btn-primary">Start Transformation</Link>
            <Link href="/#reviews" className="hph-btn-secondary">Watch Showcase</Link>
          </div>

          {/* Social proof */}
          <div className="hph-social">
            <div className="hph-avatars">
              <Image src="/avatars/female1.jpg" alt="user" width={44} height={44} className="hph-avatar" />
              <Image src="/avatars/female2.jpg" alt="user" width={44} height={44} className="hph-avatar" />
              <Image src="/avatars/av4.jpg"     alt="user" width={44} height={44} className="hph-avatar" />
            </div>
            <div>
              <p className="hph-social-text">2,500+ Architecture Firms</p>
              <p className="hph-social-sub">Trusted Global Partnerships</p>
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
              itemOne={<ReactCompareSliderImage src="/hero-before.jpg" alt="Before" style={{ objectFit: "cover" }} />}
              itemTwo={<ReactCompareSliderImage src="/hero-after.jpg"  alt="After"  style={{ objectFit: "cover" }} />}
            />

            {/* Labels */}
            <span style={{ position:"absolute", top:24, left:24, zIndex:20, padding:"8px 16px", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:"0.65rem", letterSpacing:"0.15em", borderRadius:100, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none", textTransform:"uppercase" }}>
              Before: Conceptual
            </span>
            <span style={{ position:"absolute", top:24, right:24, zIndex:20, padding:"8px 16px", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:"0.65rem", letterSpacing:"0.15em", borderRadius:100, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none", textTransform:"uppercase" }}>
              After: Realistic
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
              <span className="hph-float-label">Pro Rendered</span>
            </div>
            <div className="hph-float-bar-bg">
              <div className="hph-float-bar-fill" />
            </div>
            <p className="hph-float-sub">Processing complete in 1.2s</p>
          </div>
        </div>

      </div>

      {/* ── Feature cards ── */}
      <div className="hph-features">
        {features.map((f) => (
          <Link href="/dashboard" key={f.title} className="hph-feat-card">
            <div className="hph-feat-icon">{f.icon}</div>
            <h3 className="hph-feat-title">{f.title}</h3>
            <p className="hph-feat-desc">{f.desc}</p>
          </Link>
        ))}
      </div>

    </section>
  );
}
