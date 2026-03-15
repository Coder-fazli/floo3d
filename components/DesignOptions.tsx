"use client";

import "./DesignOptions.css";
import Link from "next/link";
import { useEffect, useRef } from "react";

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
      <div className="do-layer do-layer-before" style={{ backgroundImage: `url(${before})` }} />
      <div className="do-layer do-layer-after"  style={{ backgroundImage: `url(${after})` }} />
      <div className="do-scanner-line" />
      <span className="do-label do-label-before">Before</span>
      <span className="do-label do-label-after">After</span>
      {badge && <div className="do-img-badge">{badge}</div>}
    </div>
  );
}

export default function DesignOptions() {
  const refHeader = useFadeIn();
  const ref01 = useFadeIn();
  const ref02 = useFadeIn();
  const ref03 = useFadeIn();
  const ref04 = useFadeIn();

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
          Witness the evolution of space. From blueprints to sanctuaries — we bridge the gap between imagination and reality.
        </p>
      </div>

      {/* ── Items ── */}
      <div className="do-items">

        {/* 01 — 2D Floor Plan to 3D */}
        <div className="do-item do-fade" ref={ref01}>
          <span className="do-ghost-num" style={{ top: "-1.5rem", left: "-0.5rem" }}>01</span>
          <div className="do-grid">
            <div className="do-col-img-left">
              <ImgCard before="/faq-3d.png" after="/faq-2d.jpg" badge="Rendering Phase: Final Polish" />
            </div>
            <div className="do-col-text-right">
              <div className="do-text-card">
                <h3 className="do-item-title">2D Floor Plan to 3D</h3>
                <p className="do-item-desc">
                  We translate flat technical blueprints into dimensional experiences. Understand depth, scale, and flow with precision-engineered 3D spatial models.
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
                  Breathing new life into existing rooms. We reimagine interior aesthetics, lighting, and materiality to reflect your personal style — instantly.
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
              <ImgCard before="/card-room-after.webp" after="/card-room-before.webp" />
            </div>
          </div>
        </div>

        {/* 03 — Empty the Room */}
        <div className="do-item do-fade" ref={ref03}>
          <div className="do-flex-row">
            <div className="do-flex-img">
              <ImgCard before="/card-empty-before.webp" after="/card-empty-after.webp" />
              <div className="do-corner-thumb">
                <img src="/card-empty-after.webp" alt="Empty room" />
              </div>
            </div>
            <div className="do-flex-text">
              <span className="do-num-large">03</span>
              <h3 className="do-item-title">Empty the Room</h3>
              <p className="do-item-desc">
                Clear any space instantly. Our AI removes all furniture and decor to reveal the bare room — perfect for planning fresh layouts and new ideas.
              </p>
              <Link href="/dashboard" className="do-cta-btn">Try It Now</Link>
            </div>
          </div>
        </div>

        {/* 04 — Outdoor / Garden */}
        <div className="do-item do-fade" ref={ref04}>
          <div className="do-flex-row-rev">
            <div className="do-flex-img-60">
              <ImgCard before="/card-outdoor-before.webp" after="/card-outdoor-after.webp" />
            </div>
            <div className="do-flex-text-40">
              <span className="do-eyebrow-sm">Final Chapter</span>
              <h3 className="do-title-italic">OUTDOOR<br />VISUALS</h3>
              <p className="do-item-desc">
                Transform any outdoor space. From gardens to terraces, we visualize your dream exterior with realistic materials, lighting, and landscaping.
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
