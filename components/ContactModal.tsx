"use client";

import "./ContactModal.css";
import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function ContactModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      setError("Something went wrong. Please email us directly at myhomestylercom@gmail.com");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cm-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cm-modal">
        <button className="cm-close" onClick={onClose} aria-label="Close">
          <X size={14} strokeWidth={2.5} />
        </button>

        {sent ? (
          <div className="cm-success">
            <div className="cm-success-icon">
              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="cm-success-title">Message sent!</p>
            <p className="cm-success-sub">We'll get back to you within 1–2 business days.</p>
          </div>
        ) : (
          <>
            <div className="cm-icon">
              <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="cm-title">Contact Support</h2>
            <p className="cm-sub">We typically respond within 1–2 business days.</p>

            <form onSubmit={handleSubmit}>
              <div className="cm-field">
                <label className="cm-label">Name</label>
                <input
                  className="cm-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="cm-field">
                <label className="cm-label">Email</label>
                <input
                  className="cm-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="cm-field">
                <label className="cm-label">Message</label>
                <textarea
                  className="cm-textarea"
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {error && <p className="cm-error">{error}</p>}

              <button className="cm-submit" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
