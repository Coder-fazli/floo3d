"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type Rating = "like" | "dislike" | null;

interface RateRenderProps {
  projectId: string;
  initialRating?: Rating;
}

function CountFlip({ value, color }: { value: number; color: string }) {
  return (
    <span style={{ position: "relative", display: "inline-block", minWidth: "0.8rem", overflow: "hidden", height: "1.2em", verticalAlign: "middle" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ position: "absolute", inset: 0, color, fontWeight: 700, fontSize: "0.82rem" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function RateRender({ projectId, initialRating = null }: RateRenderProps) {
  const [rating, setRating] = useState<Rating>(initialRating);
  const [saving, setSaving] = useState(false);

  const handle = async (val: "like" | "dislike") => {
    if (saving) return;
    const next: Rating = rating === val ? null : val;
    setRating(next);
    setSaving(true);
    await fetch("/api/rate-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, rating: next }),
    }).finally(() => setSaving(false));
  };

  const liked    = rating === "like";
  const disliked = rating === "dislike";

  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0 1rem",
    height: "100%",
    border: "none",
    cursor: "pointer",
    borderRadius: 0,
    fontFamily: "inherit",
    outline: "none",
    transition: "background 0.18s",
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      background: "#f1f5f9",
      borderRadius: "9999px",
      overflow: "hidden",
      border: "1.5px solid #e2e8f0",
      height: "2.4rem",
      userSelect: "none",
      flexShrink: 0,
    }}>

      {/* ── Like ── */}
      <motion.button
        onClick={() => handle("like")}
        whileTap={{ scale: 0.78 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        style={{
          ...btnBase,
          background: liked ? "rgba(236,91,19,0.12)" : "transparent",
        }}
        title="Good render"
      >
        <motion.div
          animate={liked
            ? { rotate: [0, -25, 12, -5, 0], scale: [1, 1.45, 0.88, 1.05, 1] }
            : { rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 10 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          {/* SVG thumbs-up — fills on active */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "var(--brand-color)" : "none"} stroke={liked ? "var(--brand-color)" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
        </motion.div>
        <CountFlip value={liked ? 1 : 0} color={liked ? "var(--brand-color)" : "#94a3b8"} />
      </motion.button>

      {/* Divider */}
      <div style={{ width: "1px", height: "55%", background: "#d1d5db", flexShrink: 0 }} />

      {/* ── Dislike ── */}
      <motion.button
        onClick={() => handle("dislike")}
        whileTap={{ scale: 0.78 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        style={{
          ...btnBase,
          background: disliked ? "rgba(220,38,38,0.09)" : "transparent",
        }}
        title="Bad render"
      >
        <motion.div
          animate={disliked
            ? { rotate: [0, 25, -12, 5, 0], scale: [1, 1.45, 0.88, 1.05, 1] }
            : { rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 10 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={disliked ? "#dc2626" : "none"} stroke={disliked ? "#dc2626" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
          </svg>
        </motion.div>
        <CountFlip value={disliked ? 1 : 0} color={disliked ? "#dc2626" : "#94a3b8"} />
      </motion.button>

    </div>
  );
}
