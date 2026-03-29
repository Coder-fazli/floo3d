"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./PagePreloader.css";

const WORDS = ["MyHome", "Styler", "MyHome"];

export default function PagePreloader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    // Always restore page visibility (was hidden by the inline script in layout)
    document.documentElement.style.visibility = "";

    if (sessionStorage.getItem("preloader_shown")) return;
    sessionStorage.setItem("preloader_shown", "1");

    setVisible(true);

    const wordTimer = setInterval(() => setWordIndex((i) => i + 1), 700);
    const fadeTimer = setTimeout(() => { setFading(true); clearInterval(wordTimer); }, 2000);
    const hideTimer = setTimeout(() => setVisible(false), 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      clearInterval(wordTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`preloader ${fading ? "preloader-fade" : ""}`}>
      <div className="preloader-logo">
        <Image src="/favicon.png" alt="MyHomeStyler" width={90} height={90} priority />
      </div>
      <div className="preloader-text">
        <span className="preloader-word" key={wordIndex}>
          {WORDS[wordIndex % WORDS.length]}
        </span>
      </div>
    </div>
  );
}
