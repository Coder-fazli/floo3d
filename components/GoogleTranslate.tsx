"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

function getLang(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
  return match ? match[1] : "en";
}

function setLang(lang: string) {
  const domain = window.location.hostname;
  // Set on both root and current domain
  document.cookie = `googtrans=/en/${lang}; path=/`;
  document.cookie = `googtrans=/en/${lang}; path=/; domain=${domain}`;
  window.location.reload();
}

export default function GoogleTranslate() {
  const [lang, setLangState] = useState<string>("en");

  useEffect(() => {
    setLangState(getLang());

    // Inject Google Translate script once
    if (!document.getElementById("gt-script")) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "ar", autoDisplay: false },
          "gt-element"
        );
      };
      const s = document.createElement("script");
      s.id = "gt-script";
      s.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const toggle = () => {
    const next = lang === "en" ? "ar" : "en";
    if (next === "en") {
      // Clear translation
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      window.location.reload();
    } else {
      setLang(next);
    }
  };

  return (
    <>
      {/* Hidden element required by Google Translate */}
      <div id="gt-element" style={{ display: "none" }} />

      <button className="viz-burger-item" onClick={toggle}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {lang === "en" ? "عربي" : "English"}
      </button>
    </>
  );
}
