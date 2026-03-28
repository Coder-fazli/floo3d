"use client";

import "./HowItWorks2.css";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const, delay: i * 0.12 },
  }),
};

const steps = [
  {
    icon: "cloud_upload",
    title: "1. Upload Your Image",
    desc: "Upload a floor plan to create a 3D render, a room photo for AI interior design, or an outdoor photo for free AI landscape design. Any format works.",
    extraType: "tags" as const,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_xi8r8nBtXqawhpIG57tMWouq7LS6Fdv1R3JqRL8MBCK-aSCRiF6nF0xiXeZhcuUhOOmzzZmE7mpQljjV_wJfYNTCmPIH0LI4YlA9VpJ9nOGH-h9Lzni0SAn5gskZOPORDMv_ARttkqs7HFOxeP-7fodrdRNJxdyf2e7JzLfDB2hpK_Z6HeuZPR-TWb6FxAB_5KCEret400nZ3DIs7Yy097zMbwGISJ9mxKGM-VK2HrwjgbmgawropYR345kaNAsy6kb-nS1aEu9x",
    imgAlt: "Technical 2D floor plan blueprint drawing",
    badge: null,
  },
  {
    icon: "memory",
    title: "2. AI Neural Processing",
    desc: "Our AI interior design tool identifies your space and applies the right transformation — 3D rendering, style transfer, virtual staging, or AI backyard design — with precision.",
    extraType: "speed" as const,
    img: null,
    imgAlt: null,
    badge: null,
  },
  {
    icon: "vrpano",
    title: "3. Download Your Visual",
    desc: "Get a photorealistic result in seconds. Download in HD, share with clients via a single link, and impress with studio-quality output — no design software needed.",
    extraType: "checks" as const,
    img: "/hiw-render.png",
    imgAlt: "Modern high-end living room interior 3D render",
    badge: "Final Render",
  },
];

const stats = [
  { num: "< 60s", title: "Blazing Fast",   desc: "From upload to finished visual in less than a minute. Save hours of manual design work." },
  { num: "99.9%", title: "High Accuracy",  desc: "Proprietary AI captures every dimension with precision. Expect professional-grade results every time." },
  { num: "1-Click", title: "Zero Effort", desc: "No complex software to learn. If you can upload a file, you can create a 3D masterpiece." },
];

export default function HowItWorks2() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 80%", "end 20%"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 25, restDelta: 0.001 });
  const progressHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setActiveStep(v <= 0.05 ? -1 : v < 0.42 ? 0 : v < 0.78 ? 1 : 2);
    });
  }, [scrollYProgress]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet"
      />
      <section className="hiw2-section" id="magic">
        <div className="hiw2-inner">

          {/* Header */}
          <motion.div
            className="hiw2-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0}
          >
            <p className="hiw2-eyebrow">Best AI Interior Design Tools · Free to Use</p>
            <h2 className="hiw2-title">Upload Any Space.<br />Get a Pro Visual.</h2>
            <p className="hiw2-sub">
              The best AI app for interior design, floor plan rendering, virtual staging, and AI landscape design — all in three simple steps.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="hiw2-steps" ref={stepsRef}>

            {/* Background gray track */}
            <div className="hiw2-line">
              <div className="hiw2-line-fade-top" />
              <div className="hiw2-line-fade-bottom" />
            </div>

            {/* Animated orange fill */}
            <motion.div className="hiw2-line-progress" style={{ height: progressHeight }} />

            {/* Traveling comet at the head */}
            <motion.div className="hiw2-comet-wrap" style={{ top: progressHeight }}>
              <motion.div
                className="hiw2-comet"
                animate={{ scale: [1, 1.45, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {steps.map((step, i) => (
              <div key={i} className={`hiw2-tl-row${i % 2 === 1 ? " hiw2-tl-row-alt" : ""}`}>

                {/* Content card */}
                <motion.div
                  className="hiw2-tl-card"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -56 : 56 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const }}
                >
                  <div className="hiw2-tl-card-inner">
                    <span className="hiw2-tl-ghost">{String(i + 1).padStart(2, "0")}</span>
                    <div className="hiw2-icon-box">
                      <span className="material-symbols-outlined hiw2-icon">{step.icon}</span>
                    </div>
                    <h3 className="hiw2-step-title">{step.title}</h3>
                    <p className="hiw2-step-desc">{step.desc}</p>

                    {step.extraType === "tags" && (
                      <div className="hiw2-tags">
                        <span className="hiw2-tag">Floor Plan</span>
                        <span className="hiw2-tag">Room Photo</span>
                        <span className="hiw2-tag">Backyard / Garden</span>
                      </div>
                    )}
                    {step.extraType === "speed" && (
                      <div className="hiw2-speed">
                        <span className="material-symbols-outlined hiw2-speed-icon">speed</span>
                        Processing in under 60 seconds
                      </div>
                    )}
                    {step.extraType === "checks" && (
                      <div className="hiw2-checks">
                        <div className="hiw2-check">
                          <svg className="hiw2-check-icon" width="20" height="20" viewBox="0 0 24 24" fill="#22c55e">
                            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm4.71 7.71-5.5 5.5a1 1 0 0 1-1.42 0l-2.5-2.5a1 1 0 1 1 1.42-1.42L10.5 13.09l4.79-4.8a1 1 0 0 1 1.42 1.42z" />
                          </svg>
                          HD PNG Export
                        </div>
                        <div className="hiw2-check">
                          <svg className="hiw2-check-icon" width="20" height="20" viewBox="0 0 24 24" fill="#22c55e">
                            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm4.71 7.71-5.5 5.5a1 1 0 0 1-1.42 0l-2.5-2.5a1 1 0 1 1 1.42-1.42L10.5 13.09l4.79-4.8a1 1 0 0 1 1.42 1.42z" />
                          </svg>
                          Instant Share Link
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Center dot on the line */}
                <div className="hiw2-tl-center">
                  <motion.div
                    className={`hiw2-tl-dot${activeStep >= i ? " hiw2-tl-dot-active" : ""}`}
                    animate={activeStep >= i ? {
                      scale: [1, 1.35, 1],
                      boxShadow: [
                        "0 0 0px rgba(236,91,19,0)",
                        "0 0 18px rgba(236,91,19,0.75)",
                        "0 0 0px rgba(236,91,19,0)",
                      ],
                    } : {}}
                    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}
                  />
                </div>

                {/* Image side */}
                <div className="hiw2-tl-img-side">
                  {step.img && (
                    <motion.div
                      className="hiw2-img-card"
                      initial={{ opacity: 0, x: i % 2 === 0 ? 56 : -56 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] as const }}
                    >
                      <img src={step.img} alt={step.imgAlt ?? ""} />
                      <div className="hiw2-img-overlay" />
                      {step.badge && <div className="hiw2-render-badge">{step.badge}</div>}
                    </motion.div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="hiw2-stats">
          <div className="hiw2-stats-grid">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className="hiw2-stat-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i + 1}
              >
                <p className="hiw2-stat-num">{s.num}</p>
                <h4 className="hiw2-stat-title">{s.title}</h4>
                <p className="hiw2-stat-desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </section>
    </>
  );
}
