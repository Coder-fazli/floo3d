"use client";

import "./HowItWorks2.css";
import { motion, useMotionValue, animate } from "framer-motion";
import { useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const, delay: i * 0.12 },
  }),
};

const pairs = [
  { before: "/hiw-sketch.jpg",   after: "/hiw-living.jpg" },
  { before: "/hiw-3drender.png", after: "/hiw-floorplan.jpg" },
  { before: "/hiw-sketch2.jpg",  after: "/hiw-dark3d.jpg" },
];

const cardRotations = ["-2deg", "3deg", "-1.5deg"];

// Triple for seamless infinite loop
const allPairs = [...pairs, ...pairs, ...pairs];

const CARD_W = 340;
const GAP = 32;
const STEP = CARD_W + GAP;


function ArrowBtn({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, boxShadow: "0 6px 24px rgba(0,0,0,0.13)" }}
      whileTap={{ scale: 0.94 }}
      style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "1.5px solid #e2e8f0",
        background: "#ffffff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        outline: "none", flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {direction === "left"
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </motion.button>
  );
}

export default function HowItWorks2() {
  const OFFSET = typeof window !== "undefined" ? window.innerWidth * 0.08 : 120;
  const x = useMotionValue(-(pairs.length * STEP) + OFFSET);

  const loop = (val: number) => {
    const setW = pairs.length * STEP;
    if (val > -(setW / 2)) return val - setW;
    if (val < -(setW * 2.5)) return val + setW;
    return val;
  };

  const moveTo = (newX: number) => {
    animate(x, newX, { type: "spring", stiffness: 280, damping: 30 }).then(() => {
      const looped = loop(x.get());
      if (looped !== x.get()) x.set(looped);
    });
  };

  const goNext = () => moveTo(x.get() - STEP);
  const goPrev = () => moveTo(x.get() + STEP);

  const handleDragEnd = (_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
    const velocity = info.velocity.x;
    if (Math.abs(velocity) > 300) {
      moveTo(x.get() + (velocity > 0 ? STEP : -STEP));
    } else {
      const snapped = Math.round(x.get() / STEP) * STEP;
      moveTo(snapped);
    }
  };

  return (
    <section className="hiw2-section" id="magic">
      <div className="hiw2-inner">

        {/* Header + Arrows row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0}
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem" }}
        >
          <div style={{ maxWidth: "36rem" }}>
            <p className="hiw2-eyebrow">Best AI Interior Design Tools · Free to Use</p>
            <h2 className="hiw2-title" style={{ margin: "0 0 0.75rem" }}>Upload Any Space.<br />Get a Pro Visual.</h2>
            <p className="hiw2-sub" style={{ margin: 0 }}>
              The best AI app for interior design, floor plan rendering, virtual staging, and AI landscape design.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
            <ArrowBtn direction="left" onClick={goPrev} />
            <ArrowBtn direction="right" onClick={goNext} />
          </div>
        </motion.div>

      </div>

      {/* Carousel */}
      <div style={{
        overflow: "hidden",
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        paddingBottom: "1rem",
      }}>
        <motion.div
          drag="x"
          style={{ x, display: "flex", gap: `${GAP}px`, paddingTop: "2.5rem", paddingBottom: "2.5rem", width: "max-content", cursor: "grab", touchAction: "pan-y" }}
          dragConstraints={{ left: -(allPairs.length * STEP), right: 0 }}
          dragElastic={0.12}
          whileDrag={{ cursor: "grabbing" }}
          onDragEnd={handleDragEnd}
        >
          {allPairs.map((pair, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: `${CARD_W}px`,
                height: "260px",
                flexShrink: 0,
                transform: `rotate(${cardRotations[i % cardRotations.length]})`,
              }}
            >
              {/* Sketch — wrapper for brackets, inner clips image */}
              <div className="hiw2-pair-sketch" style={{
                position: "absolute", top: "8%", left: "0%", width: "56%", height: "80%",
                transform: "rotate(-4deg)", zIndex: 2,
              }}>
                <div style={{ borderRadius: "1.25rem", overflow: "hidden", width: "100%", height: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)", position: "relative" }}>
                  <img src={pair.before} alt="Input" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#ffffff" }} draggable={false} />
                  <div style={{ position: "absolute", bottom: 10, left: 10, background: "var(--brand-color)", borderRadius: "9999px", padding: "4px 12px", color: "#fff", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Input</div>
                </div>
              </div>

              {/* Result — wrapper for brackets, inner clips image */}
              <div className="hiw2-pair-result" style={{
                position: "absolute", top: "0%", right: "0%", width: "56%", height: "92%",
                transform: "rotate(2deg)", zIndex: 3,
              }}>
                <div style={{ borderRadius: "1.25rem", overflow: "hidden", width: "100%", height: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)", position: "relative" }}>
                  <img src={pair.after} alt="AI Result" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#ffffff" }} draggable={false} />
                  <div style={{ position: "absolute", bottom: 10, left: 10, background: "var(--brand-color)", borderRadius: "9999px", padding: "4px 12px", color: "#fff", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Result</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
