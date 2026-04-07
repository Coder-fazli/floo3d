"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AITextLoadingProps {
  texts?: string[];
  className?: string;
  interval?: number;
}

export const LOADING_TEXTS: Record<string, string[]> = {
  "floor-plan": [
    "Reading your blueprint…",
    "Mapping walls & rooms…",
    "Conjuring the third dimension…",
    "Breathing life into the layout…",
    "Placing furniture with care…",
    "Casting light through the windows…",
    "Polishing every corner…",
    "Almost there — magic takes a moment…",
  ],
  "interior-design": [
    "Studying your space…",
    "Pulling inspiration from the cosmos…",
    "Reimagining your walls & floors…",
    "Curating the perfect palette…",
    "Styling furniture to perfection…",
    "Sprinkling in the finishing touches…",
    "One last look in the mirror…",
    "Your dream room is almost ready…",
  ],
  "outdoor": [
    "Surveying your outdoor canvas…",
    "Sketching the landscape…",
    "Planting trees & sculpting paths…",
    "Dialing in the golden hour light…",
    "Adding the finishing greenery…",
    "Letting nature breathe…",
    "Almost bloomed…",
  ],
  "empty-room": [
    "Scanning the empty space…",
    "Selecting statement pieces…",
    "Arranging the furniture…",
    "Layering textures & colors…",
    "Hanging the art just right…",
    "Letting in the light…",
    "Almost furnished…",
  ],
};

export default function AITextLoading({
  texts,
  className = "",
  interval = 1900,
}: AITextLoadingProps) {
  const list = texts ?? LOADING_TEXTS["floor-plan"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, interval);
    return () => clearInterval(timer);
  }, [list, interval]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.38, ease: "easeInOut" }}
          className="bg-gradient-to-r from-neutral-300 via-white to-neutral-200 bg-clip-text text-transparent text-lg font-semibold tracking-wide"
          style={{
            backgroundSize: "200% auto",
            animation: "shimmer 2.2s linear infinite",
          }}
        >
          {list[index]}
        </motion.p>
      </AnimatePresence>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
