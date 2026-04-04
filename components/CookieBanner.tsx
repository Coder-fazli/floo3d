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
      position: "fixed", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, width: "calc(100% - 2rem)", maxWidth: "560px",
      background: "#0f172a", borderRadius: "1rem",
      padding: "1rem 1.25rem", boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
    }}>
      <p style={{ flex: 1, fontSize: "0.8rem", color: "#94a3b8", margin: 0, minWidth: "200px", lineHeight: 1.5 }}>
        🍪 We use cookies to improve your experience. See our{" "}
        <Link href="/privacy-policy" style={{ color: "#ec5b13", textDecoration: "underline" }}>Privacy Policy</Link>.
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={decline} style={{
          padding: "0.45rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent", color: "#64748b", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
        }}>
          Decline
        </button>
        <button onClick={accept} style={{
          padding: "0.45rem 1rem", borderRadius: "0.5rem", border: "none",
          background: "#ec5b13", color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
        }}>
          Accept
        </button>
      </div>
    </div>
  );
}
