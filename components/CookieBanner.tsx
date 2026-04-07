"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "1rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      width: "calc(100% - 1.5rem)",
      maxWidth: "520px",
      background: "#ffffff",
      borderRadius: "1.25rem",
      border: "1.5px solid rgba(236,91,19,0.18)",
      padding: "1rem 1.25rem",
      boxShadow: "0 8px 40px rgba(236,91,19,0.12), 0 2px 12px rgba(0,0,0,0.07)",
      display: "flex",
      flexDirection: "column",
      gap: "0.875rem",
    }}>

      {/* Icon + text */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div style={{
          width: "2rem", height: "2rem", borderRadius: "0.625rem", flexShrink: 0,
          background: "rgba(236,91,19,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem",
        }}>
          🍪
        </div>
        <div>
          <p style={{ margin: "0 0 0.25rem", fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
            We use cookies
          </p>
          <p style={{ margin: 0, fontSize: "0.76rem", color: "#64748b", lineHeight: 1.5 }}>
            To improve your experience and analyse traffic. See our{" "}
            <Link href="/privacy-policy" style={{ color: "#ec5b13", fontWeight: 600, textDecoration: "none" }}>
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.625rem" }}>
        <button onClick={decline} style={{
          flex: 1,
          padding: "0.5rem 1rem",
          borderRadius: "0.75rem",
          border: "1.5px solid #e2e8f0",
          background: "#f8fafc",
          color: "#64748b",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "border-color 0.15s",
        }}>
          Decline
        </button>
        <button onClick={accept} style={{
          flex: 2,
          padding: "0.5rem 1rem",
          borderRadius: "0.75rem",
          border: "none",
          background: "#ec5b13",
          color: "#fff",
          fontSize: "0.8rem",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 4px 14px rgba(236,91,19,0.3)",
          transition: "opacity 0.15s",
        }}>
          Accept All
        </button>
      </div>

    </div>
  );
}
