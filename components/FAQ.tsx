"use client";

import "./FAQ.css";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_FAQS = [
  {
    q: "Is this the best free AI interior design app?",
    a: "MyHomeStyler is among the best AI interior design tools available — and it's free to start. Every new account gets 2 free credits covering all 4 tools: AI interior design, free AI floor plan generator, virtual staging AI, and AI landscape design. No credit card required.",
  },
  {
    q: "Can I use it as a free AI room design and room planner?",
    a: "Yes. MyHomeStyler is a full AI room planner and AI interior styler in one. Upload a room photo, pick a style, and the AI interior design generator redesigns the space with new furniture, materials, and lighting — keeping your original layout intact.",
  },
  {
    q: "Does it support AI landscape design and AI backyard design free?",
    a: "Absolutely. The Outdoor tool supports free AI landscape design, AI backyard design, AI garden design, and home exterior design. Upload any outdoor photo and get a photorealistic redesign with realistic plants, materials, and lighting.",
  },
  {
    q: "Can I convert a 2D floor plan to 3D online free?",
    a: "Yes — MyHomeStyler is a free AI floor plan generator that converts 2D floor plans to 3D renders online, no software or account setup needed. Upload a blueprint or hand-drawn sketch and get a photorealistic 3D result in under 60 seconds.",
  },
];

export default function FAQ({ faqs, twoColumns }: { faqs?: { q: string; a: string }[]; twoColumns?: boolean } = {}) {
  const [active, setActive] = useState<number | null>(null);
  const FAQS = faqs ?? DEFAULT_FAQS;

  return (
    <section className="faq-section" id="answers">
      <div className={`faq-inner${twoColumns ? " faq-inner-full" : ""}`}>

        <div className="faq-left faq-left-full">
          <header className="faq-header">
            <span className="faq-eyebrow">Help Center</span>
            <h2 className="faq-title">Got Questions?<br />We've Got Answers.</h2>
            <p className="faq-sub">Everything you need to know about MyHomeStyler.</p>
          </header>

          <div className={`faq-list${twoColumns ? " faq-list-two-col" : ""}`}>
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

      </div>
    </section>
  );
}
