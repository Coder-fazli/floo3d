"use client";

import { useEffect, useState } from "react";
import { MorphingText } from "@/components/ui/morphing-text";
import Image from "next/image";
import "./PagePreloader.css";

export default function PagePreloader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Always restore page visibility (hidden by inline script in layout on first visit)
    document.documentElement.style.visibility = "";

    if (sessionStorage.getItem("preloader_shown")) return;
    sessionStorage.setItem("preloader_shown", "1");
    setVisible(true);
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const hideTimer = setTimeout(() => setVisible(false), 2600);
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
