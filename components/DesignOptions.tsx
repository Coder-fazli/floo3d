"use client";

import "./DesignOptions.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
import AutoCompareSlider from "@/components/AutoCompareSlider";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("do-visible"); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ImgCard({ before, after, badge }: { before: string; after: string; badge?: string }) {
  return (
    <div className="do-img-card">
      <AutoCompareSlider before={before} after={after} />
      <span className="do-label do-label-before">Before</span>
      <span className="do-label do-label-after">After</span>
      {badge && <div className="do-img-badge">{badge}</div>}
    </div>
  );
}

type TransformImages = Record<string, { before?: string; after?: string }>;

export default function DesignOptions({ transformImages = {} }: { transformImages?: TransformImages }) {
  const refHeader = useFadeIn();
  const ref01 = useFadeIn();
  const ref02 = useFadeIn();
  const ref03 = useFadeIn();
  const ref04 = useFadeIn();

  const img = (section: string, side: "before" | "after", fallback: string) =>
    transformImages[section]?.[side] || fallback;

  return (
    <section className="do-section">

      {/* ── Header ── */}
      <div className="do-header do-fade" ref={refHeader}>
        <div>
          <span className="do-eyebrow">Visual Storytelling</span>
          <h2 className="do-heading">
            LIMITLESS<br />
            <span className="do-heading-accent">TRANSFORMATIONS</span>
          </h2>
        </div>
        <p className="do-header-desc">
          The best AI interior design tools in one place — from free AI floor plan generators to AI landscape design, room redesign, and virtual staging.
        </p>
      </div>

      {/* ── Items ── */}
      <div className="do-items">

        {/* 01 — Blueprint Floor Plan to 3D */}
        <div className="do-item do-fade" ref={ref01}>
          <span className="do-ghost-num" style={{ top: "-1.5rem", left: "-0.5rem" }}>01</span>
          <div className="do-grid">
            <div className="do-col-img-left">
              <ImgCard before={img("01","before","/real-2d-plan.jpg")} after={img("01","after","/real-3d-render.jpg")} badge="Rendering Phase: Final Polish" />
            </div>
            <div className="do-col-text-right">
              <div className="do-text-card">
                <h3 className="do-item-title">Blueprint Floor Plan to 3D</h3>
                <p className="do-item-desc">
                  The easiest way to convert 2D floor plans to 3D online — free AI floor plan generator with no software needed. Upload a blueprint, get a photorealistic render instantly.
                </p>
                <Link href="/dashboard" className="do-item-link">
                  <span className="do-item-link-text">Explore Now</span>
                  <span className="do-item-link-arrow">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 02 — Room Style Transfer */}
        <div className="do-item do-fade" ref={ref02}>
          <span className="do-ghost-num" style={{ top: "-1.5rem", right: "-0.5rem" }}>02</span>
          <div className="do-grid">
            <div className="do-col-text-left">
              <div className="do-text-card">
                <h3 className="do-item-title">Room Style Transfer</h3>
                <p className="do-item-desc">
                  The best AI interior design tool for room redesign. Upload any room photo, pick a style, and our AI interior design generator reimagines the space with new furniture, materials, and lighting.
                </p>
                <Link href="/dashboard" className="do-item-link">
                  <span className="do-item-link-text">View Concepts</span>
                  <span className="do-item-link-arrow">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </Link>
              </div>
            </div>
            <div className="do-col-img-right">
              <ImgCard before={img("02","before","/fp-before-1.png")} after={img("02","after","/fp-after-1.jpg")} />
            </div>
          </div>
        </div>

        {/* 03 — Empty the Room */}
        <div className="do-item do-fade" ref={ref03}>
          <div className="do-flex-row">
            <div className="do-flex-img">
              <ImgCard before={img("03","before","/fp-before-2.png")} after={img("03","after","/fp-after-2.jpg")} />
              <div className="do-corner-thumb">
                <img src={img("03","after","/fp-after-2.jpg")} alt="3D render" />
              </div>
            </div>
            <div className="do-flex-text">
              <span className="do-num-large">03</span>
              <h3 className="do-item-title">Empty the Room</h3>
              <p className="do-item-desc">
                AI virtual staging made simple — remove all furniture and decor instantly to reveal a clean, empty space. Perfect for real estate listings and planning fresh layouts.
              </p>
              <Link href="/dashboard" className="do-cta-btn">Try It Now</Link>
            </div>
          </div>
        </div>

        {/* 04 — Outdoor / Garden */}
        <div className="do-item do-fade" ref={ref04}>
          <div className="do-flex-row-rev">
            <div className="do-flex-img-60">
              <ImgCard before={img("04","before","/card-outdoor-before.avif")} after={img("04","after","/card-outdoor-after.avif")} />
            </div>
            <div className="do-flex-text-40">
              <span className="do-eyebrow-sm">Final Chapter</span>
              <h3 className="do-title-italic">OUTDOOR<br />VISUALS</h3>
              <p className="do-item-desc">
                Free AI landscape design for any outdoor space. AI backyard design, garden design, and home exterior design — visualize your dream outdoor space with realistic materials and lighting.
              </p>
              <div className="do-stats">
                <div className="do-stat-row">
                  <span className="do-stat-val">HD</span>
                  <span className="do-stat-label">Ultra-High Resolution Output</span>
                </div>
                <div className="do-stat-row">
                  <span className="do-stat-val">6</span>
                  <span className="do-stat-label">Outdoor Design Styles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
