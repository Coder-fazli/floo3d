"use client";

import "./FAQ.css";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Is Floo3D an AI home design tool — and is it free?",
    a: "Yes. Floo3D is an AI home design platform that covers floor plan rendering, room design AI, style transfer, and outdoor visuals. Every new account gets 5 free credits — no credit card needed. It's the easiest way to try AI interior design free.",
  },
  {
    q: "Can I use it as a room planner or AI interior styler?",
    a: "Absolutely. Floo3D acts as a full room planner and AI interior styler in one. Upload a room photo and choose a style — the AI redesigns the space with new furniture, materials, and lighting while keeping your layout intact.",
  },
  {
    q: "What makes Floo3D different from other Room Design AI tools?",
    a: "Most room design AI tools only handle one task. Floo3D is a unified Home AI that covers 2D floor plans → 3D renders, room style transfer, empty-room clearing, and outdoor/garden design — all from a single upload.",
  },
  {
    q: "Can I download or share my results?",
    a: "Yes! Download your finished visual as a high-quality PNG, or share it instantly with clients via a shareable link — perfect for presentations, emails, and social media.",
  },
];

export default function FAQ() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="faq-section" id="answers">
      <div className="faq-inner">

        {/* Left — Questions */}
        <div className="faq-left">
          <header className="faq-header">
            <span className="faq-eyebrow">Help Center</span>
            <h2 className="faq-title">Got Questions?<br />We've Got Answers.</h2>
            <p className="faq-sub">Select a card to explore how Floo3D transforms your architectural workflow.</p>
          </header>

          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`faq-item${active === i ? " faq-item-open" : ""}`}
              >
                <button
                  className="faq-trigger"
                  onClick={() => setActive(active === i ? null : i)}
                >
                  <span className="faq-q">{faq.q}</span>
                  <span className={`faq-arrow${active === i ? " faq-arrow-active" : ""}`}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {active === i && (
                    <motion.div
                      className="faq-answer-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="faq-answer-text">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Visual Showcase */}
        <div className="faq-right">
          <div className="faq-right-label">The Magic of Floo3D</div>

          <div className="faq-visual-wrap">
            {/* Floating cards */}
            <div className="faq-float faq-float-tl">
              <svg width="44" height="44" fill="none" stroke="#ec5b13" viewBox="0 0 24 24">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="faq-float faq-float-br">
              <svg width="52" height="52" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Central card — hover to reveal 3D */}
            <div className="faq-card-group">

              {/* 3D render layer — revealed on hover */}
              <div className="faq-layer faq-layer-3d">
                <Image src="/faq-3d.png" alt="3D Floor Plan Render" className="faq-layer-img faq-img-scale" fill style={{ objectFit: "cover" }} />
                <div className="faq-tint" />
                <div className="faq-scanner-line" />
              </div>

              {/* 2D blueprint layer — hidden on hover */}
              <div className="faq-layer faq-layer-2d">
                <div className="faq-2d-inner">
                  <Image src="/faq-2d.jpg" alt="2D Blueprint" className="faq-layer-img faq-img-gray" fill style={{ objectFit: "cover" }} />
                </div>
                <div className="faq-2d-overlay" />
                <div className="faq-grid-overlay" />
              </div>

              {/* Labels */}
              <div className="faq-label-2d">Source: 2D Plan</div>
              <div className="faq-label-3d">Output: 3D Visualization</div>

              {/* Hover CTA */}
              <div className="faq-hover-cta">
                <span className="faq-cta-text">Hover to Render</span>
                <span className="faq-cta-dot" />
              </div>
            </div>

            {/* Technical accent lines */}
            <div className="faq-accent faq-accent-right" />
            <div className="faq-accent faq-accent-left" />
          </div>
        </div>

      </div>
    </section>
  );
}
