"use client";

import "./HowItWorks.css";
import { CloudUpload, BarChart2, Box, Sparkles } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, decimals = 0, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals, duration]);

  return { value, ref };
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".hiw-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function HowItWorks() {
  const { openSignUp } = useClerk();
  const accuracy = useCountUp(99.9, 1, 2000);
  const speed = useCountUp(5, 0, 1500);
  const uptime24 = useCountUp(24, 0, 1800);
  const uptime7 = useCountUp(7, 0, 1800);
  useScrollReveal();

  return (
    <main className="hiw-main">

      {/* Section header */}
      <div className="hiw-header">
        <h2 className="hiw-eyebrow">Workflow Efficiency</h2>
        <h3 className="hiw-title">
          From Sketch to Reality <br /> in Four Simple Steps
        </h3>
        <p className="hiw-subtitle">
          Floo3D streamlines the architectural visualization process. Our AI-driven engine handles the heavy lifting, allowing you to focus on design.
        </p>
      </div>

      {/* Bento grid */}
      <div className="hiw-grid">

        {/* Step 01 — Upload Blueprint (large) */}
        <div className="hiw-card hiw-card-large hiw-card-upload hiw-reveal" style={{ transitionDelay: "0ms" }}>
          <div className="hiw-card-content">
            <div className="hiw-icon-wrap hiw-icon-primary">
              <CloudUpload size={40} />
            </div>
            <span className="hiw-step hiw-step-primary">Step 01</span>
            <h4 className="hiw-card-title">Upload Blueprint</h4>
            <p className="hiw-card-desc">
              Upload your 2D sketches, PDF floor plans, or direct CAD files. We support all major industry formats with precision parsing.
            </p>
          </div>
          <div className="hiw-card-deco">
            <div className="hiw-deco-shape" />
          </div>
        </div>

        {/* Step 02 — AI Neural Analysis (wide) */}
        <div className="hiw-card hiw-card-wide hiw-card-glass hiw-reveal" style={{ transitionDelay: "100ms" }}>
          <div className="hiw-card-row">
            <div className="hiw-icon-wrap hiw-icon-blue">
              <BarChart2 size={36} />
            </div>
            <div>
              <span className="hiw-step hiw-step-blue">Step 02</span>
              <h4 className="hiw-card-title">AI Neural Analysis</h4>
              <p className="hiw-card-desc">
                Automated detection of structural elements: walls, windows, and load-bearing points in seconds.
              </p>
            </div>
          </div>
          <div className="hiw-blue-glow" />
        </div>

        {/* Step 03 — 3D Wireframe */}
        <div className="hiw-card hiw-card-small hiw-card-dots hiw-reveal" style={{ transitionDelay: "200ms" }}>
          <div className="hiw-dot-bg" />
          <div className="hiw-card-content hiw-card-bottom">
            <div className="hiw-icon-wrap hiw-icon-purple">
              <Box size={28} />
            </div>
            <span className="hiw-step hiw-step-purple">Step 03</span>
            <h4 className="hiw-card-title">3D Wireframe</h4>
          </div>
        </div>

        {/* Step 04 — Instant Render */}
        <div className="hiw-card hiw-card-small hiw-card-render hiw-reveal" style={{ transitionDelay: "300ms" }}>
          <div className="hiw-render-overlay" />
          <div className="hiw-card-content hiw-card-bottom">
            <div className="hiw-icon-wrap hiw-icon-white">
              <Sparkles size={28} />
            </div>
            <span className="hiw-step hiw-step-white">Step 04</span>
            <h4 className="hiw-card-title hiw-white">Instant Render</h4>
          </div>
        </div>

      </div>

      {/* Stats bar */}
      <div className="hiw-stats">
        <div className="hiw-stat">
          <span className="hiw-stat-value" ref={accuracy.ref}>{accuracy.value}%</span>
          <p className="hiw-stat-label">Element Accuracy</p>
        </div>
        <div className="hiw-stat hiw-stat-bordered">
          <span className="hiw-stat-value" ref={speed.ref}>&lt; {speed.value}s</span>
          <p className="hiw-stat-label">Processing Time</p>
        </div>
        <div className="hiw-stat">
          <span className="hiw-stat-value" ref={uptime24.ref}>{uptime24.value}/{uptime7.value}</span>
          <p className="hiw-stat-label">Cloud Availability</p>
        </div>
      </div>

      {/* CTA */}
      <div className="hiw-cta">
        <div className="hiw-cta-glow" />
        <div className="hiw-cta-content">
          <h3 className="hiw-cta-title">Ready to see your design in 3D?</h3>
          <div className="hiw-cta-actions">
            <button
              className="hiw-cta-btn hiw-cta-btn-primary"
              onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}
            >
              Start Your First Project
            </button>
            <button className="hiw-cta-btn hiw-cta-btn-ghost">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}
