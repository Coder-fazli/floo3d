"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  before: string;
  after: string;
}

const STAR_PATH = "M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z";

const SPARK_COLORS = ["#ec5b13", "#ffd54f", "#ec5b13", "#fff176"];

// Spread sparks randomly across the image; positions are seeded per burst so they vary
const SPARK_COUNT = 8;

function SparkBurst({ burstSeed }: { burstSeed: number }) {
  // Deterministic pseudo-random positions based on seed so each burst looks different
  const sparks = Array.from({ length: SPARK_COUNT }, (_, i) => {
    const s = burstSeed + i * 137;
    const x = 5 + ((s * 9301 + 49297) % 233280) / 233280 * 90; // 5–95%
    const y = 5 + ((s * 3571 + 71831) % 233280) / 233280 * 90; // 5–95%
    const color = SPARK_COLORS[i % SPARK_COLORS.length];
    const delay = (i * 0.06) % 0.4;
    return { x, y, color, delay };
  });

  return (
    <>
      {sparks.map(({ x, y, color, delay }, i) => (
        <motion.svg
          key={i}
          style={{ position: "absolute", left: `${x}%`, top: `${y}%`, pointerEvents: "none", zIndex: 20 }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 120, 240] }}
          transition={{ duration: 0.65, delay, ease: "easeOut" }}
          width="14"
          height="14"
          viewBox="0 0 21 21"
        >
          <path d={STAR_PATH} fill={color} />
        </motion.svg>
      ))}
    </>
  );
}

export default function AutoCompareSlider({ before, after }: Props) {
  const posRef  = useRef(8);
  const dirRef  = useRef(1);
  const rafRef  = useRef<number>(0);
  const lastRef = useRef<number>(0);

  const [pos, setPos]         = useState(8);
  const [burstKey, setBurstKey] = useState<number | null>(null);

  useEffect(() => {
    const SPEED = 0.022; // % per ms  →  ~2.2s per full sweep

    const ease = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // We drive raw linear time, apply ease per segment
    let segStart = 0;
    const SEG = 2200; // ms per direction

    const loop = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      if (segStart === 0) segStart = now;

      const raw = Math.min((now - segStart) / SEG, 1);
      const t   = ease(raw);
      const from = dirRef.current === 1 ? 8 : 92;
      const to   = dirRef.current === 1 ? 92 : 8;
      const next = from + t * (to - from);

      posRef.current = next;
      setPos(next);

      if (raw >= 1) {
        dirRef.current *= -1;
        segStart = now;
        setBurstKey(Date.now());
      }

      lastRef.current = now;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", userSelect: "none" }}>

      {/* After — full */}
      <img
        src={after}
        alt="After"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />

      {/* Before — clipped to left side */}
      <img
        src={before}
        alt="Before"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block",
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
        }}
      />

      {/* Divider line */}
      <div
        style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${pos}%`, transform: "translateX(-50%)",
          width: 2,
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 0 6px rgba(0,0,0,0.3)",
          pointerEvents: "none",
        }}
      />

      {/* Sparkle burst on reversal — sparks scattered across full image */}
      <AnimatePresence>
        {burstKey !== null && (
          <SparkBurst key={burstKey} burstSeed={burstKey} />
        )}
      </AnimatePresence>
    </div>
  );
}
