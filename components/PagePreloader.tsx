"use client";

import { useEffect, useState } from "react";
import { MorphingText } from "@/components/ui/morphing-text";
import "./PagePreloader.css";

export default function PagePreloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`preloader ${fading ? "preloader-fade" : ""}`}>
      <MorphingText
        className="preloader-text"
        texts={["MyHomeStyler", "AI Design", "Your Vision", "Reimagined"]}
      />
    </div>
  );
}
