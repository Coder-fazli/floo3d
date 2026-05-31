"use client";

import "./FAQ.css";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export default function FAQ({ faqs, twoColumns }: { faqs?: { q: string; a: string }[]; twoColumns?: boolean } = {}) {
  const [active, setActive] = useState<number | null>(null);
  const t = useTranslations("faq");
  const DEFAULT_FAQS = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
  ];
  const FAQS = faqs ?? DEFAULT_FAQS;

  return (
    <section className="faq-section" id="answers">
      <div className={`faq-inner${twoColumns ? " faq-inner-full" : ""}`}>

        <div className="faq-left faq-left-full">
          <header className="faq-header">
            <span className="faq-eyebrow">{t("eyebrow")}</span>
            <h2 className="faq-title">{t("title").split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
            <p className="faq-sub">{t("sub")}</p>
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
