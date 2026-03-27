"use client";

import "./HomePageHero.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage } from "react-compare-slider";
import { useClerk, useUser } from "@clerk/nextjs";

const features = [
  {
    title: "Instant 3D Renders",
    desc: "Upload any 2D floor plan and get a photorealistic 3D render in under 60 seconds.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/>
        <path d="M12 4v16M4 12h16"/>
      </svg>
    ),
  },
  {
    title: "All Plan Types",
    desc: "Works with hand-drawn sketches, CAD exports, scanned blueprints, and digital floor plans.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    title: "Multiple Styles",
    desc: "Render your floor plan in modern, minimalist, luxury, Scandinavian, or industrial style.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
      </svg>
    ),
  },
  {
    title: "No 3D Software Needed",
    desc: "Skip SketchUp, Blender, or Revit — AI does the heavy lifting. Free to start.",
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
];

export default function FloorPlanHero() {
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
            <span className="hph-badge-text">AI Floor Plan Renderer · Free to Start</span>
          </div>

          {/* Heading */}
          <h1 className="hph-heading">
            Convert 2D Floor<br />
            <span className="hph-heading-accent">Plans to 3D</span><br />
            Renders with AI.
          </h1>

          {/* Sub */}
          <p className="hph-sub">
            Upload any 2D floor plan — hand-drawn, CAD, or scanned — and get a stunning photorealistic 3D render in seconds. No 3D software needed.
          </p>

          {/* CTAs */}
          <div className="hph-btns">
            {isSignedIn
              ? <Link href="/dashboard" className="hph-btn-primary">Try It Free</Link>
              : <button className="hph-btn-primary" onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}>Try It Free</button>
            }
            <Link href="#how-it-works" className="hph-btn-secondary">See How It Works</Link>
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
              itemOne={<ReactCompareSliderImage src="/real-2d-plan.jpg" alt="2D Floor Plan" style={{ objectFit: "cover" }} />}
              itemTwo={<ReactCompareSliderImage src="/real-3d-render.jpg" alt="3D Render" style={{ objectFit: "cover" }} />}
            />

            {/* Labels */}
            <span style={{ position:"absolute", top:24, left:24, zIndex:20, padding:"8px 16px", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:"0.65rem", letterSpacing:"0.15em", borderRadius:100, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none", textTransform:"uppercase" }}>
              Before: 2D Plan
            </span>
            <span style={{ position:"absolute", top:24, right:24, zIndex:20, padding:"8px 16px", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:"0.65rem", letterSpacing:"0.15em", borderRadius:100, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.2)", pointerEvents:"none", textTransform:"uppercase" }}>
              After: 3D Render
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
              <span className="hph-float-label">3D Render Ready</span>
            </div>
            <div className="hph-float-bar-bg">
              <div className="hph-float-bar-fill" />
            </div>
            <p className="hph-float-sub">Floor plan processed in 1.4s</p>
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
