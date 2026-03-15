"use client";

import "./HowItWorks2.css";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const, delay: i * 0.12 },
  }),
};

export default function HowItWorks2() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
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
            <p className="hiw2-eyebrow">Workflow Efficiency</p>
            <h2 className="hiw2-title">Upload Any Space.<br />Get a Pro Visual.</h2>
            <p className="hiw2-sub">Whether it's a 2D floor plan, a room photo, an empty interior, or an outdoor area — Floo3D transforms it into a professional render in three simple steps.</p>
          </motion.div>

          {/* Steps */}
          <div className="hiw2-steps">
            {/* Vertical connector line */}
            <div className="hiw2-line">
              <div className="hiw2-line-fade-top" />
              <div className="hiw2-line-fade-bottom" />
            </div>

            {/* Step 1 — Upload Floor Plan */}
            <motion.div
              className="hiw2-step-row"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={1}
            >
              <div className="hiw2-step-content">
                <div className="hiw2-icon-box">
                  <span className="material-symbols-outlined hiw2-icon">cloud_upload</span>
                </div>
                <h3 className="hiw2-step-title">1. Upload Your Image</h3>
                <p className="hiw2-step-desc">Drag and drop a floor plan, room photo, empty interior, or outdoor space. Any image works — blueprints, hand-drawn sketches, or real photos.</p>
                <div className="hiw2-tags">
                  <span className="hiw2-tag">Floor Plan</span>
                  <span className="hiw2-tag">Room Photo</span>
                  <span className="hiw2-tag">Outdoor</span>
                </div>
              </div>
              <div className="hiw2-num">01</div>
              <div className="hiw2-img-card">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_xi8r8nBtXqawhpIG57tMWouq7LS6Fdv1R3JqRL8MBCK-aSCRiF6nF0xiXeZhcuUhOOmzzZmE7mpQljjV_wJfYNTCmPIH0LI4YlA9VpJ9nOGH-h9Lzni0SAn5gskZOPORDMv_ARttkqs7HFOxeP-7fodrdRNJxdyf2e7JzLfDB2hpK_Z6HeuZPR-TWb6FxAB_5KCEret400nZ3DIs7Yy097zMbwGISJ9mxKGM-VK2HrwjgbmgawropYR345kaNAsy6kb-nS1aEu9x"
                  alt="Technical 2D floor plan blueprint drawing"
                />
                <div className="hiw2-img-overlay" />
              </div>
            </motion.div>

            {/* Step 2 — AI Neural Processing (reversed) */}
            <motion.div
              className="hiw2-step-row hiw2-step-row-reverse"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={2}
            >
              <div className="hiw2-step-content">
                <div className="hiw2-icon-box">
                  <span className="material-symbols-outlined hiw2-icon">memory</span>
                </div>
                <h3 className="hiw2-step-title">2. AI Neural Processing</h3>
                <p className="hiw2-step-desc">Our AI reads your image, identifies the space type, and applies the right transformation — 3D rendering, style transfer, room clearing, or outdoor design — with precision.</p>
                <div className="hiw2-speed">
                  <span className="material-symbols-outlined hiw2-speed-icon">speed</span>
                  Processing in under 60 seconds
                </div>
              </div>
              <div className="hiw2-num">02</div>
            </motion.div>

            {/* Step 3 — Instant 3D Render */}
            <motion.div
              className="hiw2-step-row"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={3}
            >
              <div className="hiw2-step-content">
                <div className="hiw2-icon-box">
                  <span className="material-symbols-outlined hiw2-icon">vrpano</span>
                </div>
                <h3 className="hiw2-step-title">3. Download Your Visual</h3>
                <p className="hiw2-step-desc">Get a photorealistic result in seconds. Download in HD, share with clients via a single link, and impress with studio-quality output — no design software needed.</p>
                <div className="hiw2-checks">
                  <div className="hiw2-check">
                    <svg className="hiw2-check-icon" width="20" height="20" viewBox="0 0 24 24" fill="#22c55e"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm4.71 7.71-5.5 5.5a1 1 0 0 1-1.42 0l-2.5-2.5a1 1 0 1 1 1.42-1.42L10.5 13.09l4.79-4.8a1 1 0 0 1 1.42 1.42z"/></svg>
                    HD PNG Export
                  </div>
                  <div className="hiw2-check">
                    <svg className="hiw2-check-icon" width="20" height="20" viewBox="0 0 24 24" fill="#22c55e"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm4.71 7.71-5.5 5.5a1 1 0 0 1-1.42 0l-2.5-2.5a1 1 0 1 1 1.42-1.42L10.5 13.09l4.79-4.8a1 1 0 0 1 1.42 1.42z"/></svg>
                    Instant Share Link
                  </div>
                </div>
              </div>
              <div className="hiw2-num">03</div>
              <div className="hiw2-img-card">
                <img
                  src="/hiw-render.png"
                  alt="Modern high-end living room interior 3D render"
                />
                <div className="hiw2-img-overlay" />
                <div className="hiw2-render-badge">Final Render</div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Stats */}
        <div className="hiw2-stats">
          <div className="hiw2-stats-grid">
            <motion.div
              className="hiw2-stat-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={1}
            >
              <p className="hiw2-stat-num">&lt; 60s</p>
              <h4 className="hiw2-stat-title">Blazing Fast</h4>
              <p className="hiw2-stat-desc">From upload to finished visual in less than a minute. Save hours of manual design work.</p>
            </motion.div>
            <motion.div
              className="hiw2-stat-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={2}
            >
              <p className="hiw2-stat-num">99.9%</p>
              <h4 className="hiw2-stat-title">High Accuracy</h4>
              <p className="hiw2-stat-desc">Proprietary AI captures every dimension with precision. Expect professional-grade results every time.</p>
            </motion.div>
            <motion.div
              className="hiw2-stat-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={3}
            >
              <p className="hiw2-stat-num">1-Click</p>
              <h4 className="hiw2-stat-title">Zero Effort</h4>
              <p className="hiw2-stat-desc">No complex software to learn. If you can upload a file, you can create a 3D masterpiece.</p>
            </motion.div>
          </div>
        </div>

      </section>
    </>
  );
}
