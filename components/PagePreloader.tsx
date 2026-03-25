"use client";

import { useEffect, useState } from "react";
import { MorphingText } from "@/components/ui/morphing-text";
import Image from "next/image";
import "./PagePreloader.css";

export default function PagePreloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 3000);
    const hideTimer = setTimeout(() => setVisible(false), 3600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`preloader ${fading ? "preloader-fade" : ""}`}>
      <div className="preloader-logo">
        <Image src="/favicon.png" alt="MyHomeStyler" width={90} height={90} priority />
      </div>
      <MorphingText
        className="preloader-text"
        texts={["", "MyHome", "Styler"]}
      />
    </div>
  );
}
