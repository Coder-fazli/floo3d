"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

type Rating = "like" | "dislike" | null;

interface RateRenderProps {
  projectId: string;
  initialRating?: Rating;
}

function CountFlip({ value, color }: { value: number; color: string }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: "1.4ch", overflow: "hidden", height: "1.1em" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ position: "absolute", inset: 0, color, fontWeight: 700, fontSize: "0.75rem", lineHeight: 1.5 }}
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

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      background: "#f1f5f9",
      borderRadius: "9999px",
      overflow: "hidden",
      border: "1.5px solid #e2e8f0",
      height: "2rem",
      userSelect: "none",
    }}>
      {/* Like */}
      <motion.button
        onClick={() => handle("like")}
        whileTap={{ scale: 0.82 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        style={{
          display: "flex", alignItems: "center", gap: "0.3rem",
          padding: "0 0.7rem",
          height: "100%",
          border: "none",
          cursor: "pointer",
          borderRadius: 0,
          background: liked ? "rgba(236,91,19,0.12)" : "transparent",
          transition: "background 0.2s",
          outline: "none",
        }}
        title="Good render"
      >
        <motion.div
          animate={liked ? { rotate: [0, -20, 10, 0], scale: [1, 1.35, 0.9, 1] } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
        >
          <ThumbsUp
            size={14}
            strokeWidth={liked ? 0 : 2}
            fill={liked ? "#ec5b13" : "none"}
            stroke={liked ? "#ec5b13" : "#64748b"}
          />
        </motion.div>
        <CountFlip value={liked ? 1 : 0} color={liked ? "#ec5b13" : "#94a3b8"} />
      </motion.button>

      {/* Divider */}
      <div style={{ width: "1px", height: "60%", background: "#e2e8f0", flexShrink: 0 }} />

      {/* Dislike */}
      <motion.button
        onClick={() => handle("dislike")}
        whileTap={{ scale: 0.82 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        style={{
          display: "flex", alignItems: "center", gap: "0.3rem",
          padding: "0 0.7rem",
          height: "100%",
          border: "none",
          cursor: "pointer",
          borderRadius: 0,
          background: disliked ? "rgba(220,38,38,0.08)" : "transparent",
          transition: "background 0.2s",
          outline: "none",
        }}
        title="Bad render"
      >
        <motion.div
          animate={disliked ? { rotate: [0, 20, -10, 0], scale: [1, 1.35, 0.9, 1] } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
        >
          <ThumbsDown
            size={14}
            strokeWidth={disliked ? 0 : 2}
            fill={disliked ? "#dc2626" : "none"}
            stroke={disliked ? "#dc2626" : "#64748b"}
          />
        </motion.div>
        <CountFlip value={disliked ? 1 : 0} color={disliked ? "#dc2626" : "#94a3b8"} />
      </motion.button>
    </div>
  );
}
