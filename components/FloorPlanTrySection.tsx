"use client";

import "./FloorPlanTrySection.css";
import { useState, useRef, useEffect, useCallback } from "react";
import { useClerk } from "@clerk/nextjs";
import {
  ReactCompareSlider,
  ReactCompareSliderHandle,
  ReactCompareSliderImage,
} from "react-compare-slider";

const STYLES = ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"];
const ROOM_TYPES = [
  "Living Room", "Bedroom", "Kitchen", "Bathroom",
  "Office", "Dining Room", "Studio", "Hallway", "Kids Room",
];
const STYLE_IMAGES: Record<string, string> = {
  Modern:       "/card-room-after.webp",
  Scandinavian: "/style-scandinavian.jpg",
  Industrial:   "/style-industrial.jpg",
  Rustic:       "/style-rustic.webp",
  Luxury:       "/style-luxury.jpg",
  Minimalist:   "/style-minimalist.jpg",
};

const CREDITS_KEY = "fp_guest_credits";
const CREDITS_DEFAULT = 6;

export default function FloorPlanTrySection() {
  const { openSignUp } = useClerk();

  const [guestCredits, setGuestCredits] = useState<number>(CREDITS_DEFAULT);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [renderStyle, setRenderStyle] = useState("Modern");
  const [roomType, setRoomType] = useState("Living Room");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CREDITS_KEY);
    if (stored === null) {
      localStorage.setItem(CREDITS_KEY, String(CREDITS_DEFAULT));
    } else {
      setGuestCredits(Math.max(0, parseInt(stored, 10) || 0));
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) return;
    if (file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedBase64(e.target?.result as string);
      setRenderedUrl(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleGenerate = async () => {
    if (!uploadedBase64) return;

    if (guestCredits <= 0) {
      openSignUp({ fallbackRedirectUrl: "/dashboard" });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/guest-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: uploadedBase64,
          renderStyle,
          roomType,
          inputType: "floor-plan",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setRenderedUrl(data.renderedBase64);

      const newCredits = Math.max(0, guestCredits - 1);
      setGuestCredits(newCredits);
      localStorage.setItem(CREDITS_KEY, String(newCredits));
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!renderedUrl) return;
    const a = document.createElement("a");
    a.href = renderedUrl;
    a.download = "3d-floor-plan-render.png";
    a.click();
  };

  return (
    <section className="fpts-section" id="try-converter">
      <div className="fpts-header">
        <span className="fpts-eyebrow">Free 2D to 3D Converter</span>
        <h2 className="fpts-title">
          Try It Right Here —{" "}
          <span className="fpts-title-accent">No Login Needed</span>
        </h2>
        <p className="fpts-subtitle">
          Upload your 2D floor plan and get a photorealistic 3D render instantly. Completely free.
        </p>
      </div>

      <div className="fpts-card">
        {/* Credits bar */}
        <div className="fpts-credits-bar">
          <span className="fpts-credits-icon">⚡</span>
          <span className="fpts-credits-text">
            You have{" "}
            <strong>{guestCredits} free generation{guestCredits !== 1 ? "s" : ""}</strong>{" "}
            remaining as a guest.{" "}
            <button
              className="fpts-credits-link"
              onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}
            >
              Sign up free — no credit card needed → get 10 more credits
            </button>
          </span>
        </div>

        <div className="fpts-layout">

          {/* ── Sidebar ── */}
          <div className="fpts-sidebar">

            <div className="fpts-section-label">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              Upload Your 2D Floor Plan
            </div>

            <div
              className="fpts-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {uploadedBase64 ? (
                <img src={uploadedBase64} alt="uploaded floor plan" className="fpts-dropzone-preview" />
              ) : (
                <>
                  <svg width="26" height="26" fill="none" stroke="#ec5b13" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  <p className="fpts-dropzone-text">Click to upload or drag & drop</p>
                  <p className="fpts-dropzone-sub">PNG, JPG · Max 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div className="fpts-section-label" style={{ marginTop: "1.25rem" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Room Type
            </div>
            <select
              className="fpts-select"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <div className="fpts-section-label" style={{ marginTop: "1.25rem" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
              </svg>
              Design Style
            </div>
            <div className="fpts-styles">
              {STYLES.map((s) => (
                <button
                  key={s}
                  className={`fpts-style-btn ${renderStyle === s ? "active" : ""}`}
                  onClick={() => setRenderStyle(s)}
                >
                  <img src={STYLE_IMAGES[s]} alt={s} className="fpts-style-img" />
                  <span>{s}</span>
                </button>
              ))}
            </div>

            <button
              className="fpts-generate-btn"
              onClick={handleGenerate}
              disabled={isProcessing || !uploadedBase64}
            >
              {isProcessing ? (
                <><span className="fpts-spinner" /> Generating 3D Render…</>
              ) : guestCredits <= 0 ? (
                "Sign Up for 10 More Credits →"
              ) : (
                "+ Generate 3D Render"
              )}
            </button>

            {error && <p className="fpts-error">{error}</p>}
          </div>

          {/* ── Preview ── */}
          <div className="fpts-preview">
            <div className="fpts-preview-header">
              <span className="fpts-preview-label">Preview</span>
              {renderedUrl && (
                <button className="fpts-download-btn" onClick={handleDownload}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download
                </button>
              )}
            </div>

            <div className="fpts-preview-area">
              {isProcessing ? (
                <div className="fpts-processing">
                  <div className="fpts-processing-inner">
                    <div className="fpts-processing-dots">
                      <span /><span /><span />
                    </div>
                    <p className="fpts-processing-title">Generating your 3D render…</p>
                    <p className="fpts-processing-sub">
                      Our AI is converting your floor plan. This takes 15–30 seconds.
                    </p>
                  </div>
                </div>
              ) : renderedUrl && uploadedBase64 ? (
                <ReactCompareSlider
                  style={{ width: "100%", height: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
                  handle={
                    <ReactCompareSliderHandle
                      buttonStyle={{
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(12px)",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        color: "#ec5b13",
                        width: "2.75rem",
                        height: "2.75rem",
                      }}
                      linesStyle={{ background: "rgba(255,255,255,0.35)", width: 1 }}
                    />
                  }
                  itemOne={
                    <ReactCompareSliderImage
                      src={uploadedBase64}
                      alt="Original 2D Floor Plan"
                      style={{ objectFit: "contain", background: "#0a0f1e" }}
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={renderedUrl}
                      alt="AI 3D Render"
                      style={{ objectFit: "contain", background: "#0a0f1e" }}
                    />
                  }
                />
              ) : uploadedBase64 ? (
                <div className="fpts-preview-uploaded">
                  <img src={uploadedBase64} alt="Your uploaded floor plan" />
                  <p>Select a style and click Generate</p>
                </div>
              ) : (
                <div className="fpts-preview-placeholder">
                  <ReactCompareSlider
                    style={{ width: "100%", height: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
                    handle={
                      <ReactCompareSliderHandle
                        buttonStyle={{
                          background: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(12px)",
                          border: "none",
                          color: "#ec5b13",
                          width: "2.75rem",
                          height: "2.75rem",
                        }}
                        linesStyle={{ background: "rgba(255,255,255,0.3)", width: 1 }}
                      />
                    }
                    itemOne={
                      <ReactCompareSliderImage
                        src="/real-2d-plan.jpg"
                        alt="Example 2D floor plan"
                        style={{ objectFit: "cover" }}
                      />
                    }
                    itemTwo={
                      <ReactCompareSliderImage
                        src="/real-3d-render.jpg"
                        alt="Example AI 3D render"
                        style={{ objectFit: "cover" }}
                      />
                    }
                  />
                  <div className="fpts-preview-overlay">
                    Example result — upload your floor plan to try for free
                  </div>
                </div>
              )}
            </div>

            {renderedUrl && guestCredits <= 2 && (
              <div className="fpts-upsell">
                {guestCredits === 0
                  ? <>You've used all 6 free generations. </>
                  : <><strong>{guestCredits} free generation{guestCredits !== 1 ? "s" : ""}</strong> left. </>
                }
                <button
                  className="fpts-upsell-btn"
                  onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}
                >
                  Sign up free — no credit card needed → unlock 10 more credits + save your renders
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
