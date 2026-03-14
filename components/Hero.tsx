"use client";

import "./Hero.css";
import NextImage from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from "react-compare-slider";
import { FileUp, Box } from "lucide-react";
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from "@/lib/constants";
import { getProject } from "@/lib/actions";

const FULL = "Turn 2D floor plans into 3D renders instantly";
const ACCENT_START = "Turn 2D floor plans into ".length;
const ACCENT_END = ACCENT_START + "3D renders".length;

function TypingTitle() {
  // Start with full text so SSR/Google sees the complete title
  const [count, setCount] = useState(FULL.length);

  // Reset to 0 on client to play the typing animation
  useEffect(() => {
    setCount(0);
  }, []);

  useEffect(() => {
    if (count >= FULL.length) return;
    const t = setTimeout(() => setCount(c => c + 1), 40);
    return () => clearTimeout(t);
  }, [count]);

  const visible = FULL.slice(0, count);

  return (
    <>
      {visible.slice(0, Math.min(count, ACCENT_START))}
      {count > ACCENT_START && (
        <span className="sh-accent">
          {visible.slice(ACCENT_START, ACCENT_END)}
        </span>
      )}
      {count > ACCENT_END && visible.slice(ACCENT_END)}
      {count < FULL.length && <span className="sh-cursor">|</span>}
    </>
  );
}

export default function Hero() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { openSignUp } = useClerk();
  const isUploading = useRef(false);

  // ── Demo project — fetched client-side so page renders instantly ──
  const [demoOriginal, setDemoOriginal] = useState<string | undefined>();
  const [demoRender, setDemoRender] = useState<string | undefined>();

  useEffect(() => {
    getProject("69b01aef967226f4752324b2").then((p: any) => {
      if (p) {
        setDemoOriginal(p.originalImageUrl);
        setDemoRender(p.renderedImageUrl);
      }
    }).catch(() => {});
  }, []);

  // ── Slider auto-animate ──
  const [sliderPos, setSliderPos] = useState(10);
  const rafRef = useRef<number | null>(null);
  const sliderDragging = useRef(false);

  useEffect(() => {
    if (!demoOriginal || !demoRender) return;

    let fromPos = 10;
    let toPos = 55;
    let segStart = 0;
    let segDuration = 1200;

    const pickNextTarget = (current: number) => {
      const min = 10, max = 88;
      // Always swing to the opposite side for dramatic effect
      const next = current < 50
        ? Math.round(58 + Math.random() * 30)
        : Math.round(min + Math.random() * 32);
      return Math.max(min, Math.min(max, next));
    };

    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const loop = (now: number) => {
      if (sliderDragging.current) { segStart = now; rafRef.current = requestAnimationFrame(loop); return; }

      if (segStart === 0) segStart = now;
      const elapsed = now - segStart;
      const progress = Math.min(elapsed / segDuration, 1);
      const eased = easeInOut(progress);
      setSliderPos(Math.round(fromPos + eased * (toPos - fromPos)));

      if (progress >= 1) {
        fromPos = toPos;
        toPos = pickNextTarget(fromPos);
        segDuration = 900 + Math.random() * 600;
        segStart = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    const timeout = setTimeout(() => {
      segStart = 0;
      rafRef.current = requestAnimationFrame(loop);
    }, 400);

    return () => { clearTimeout(timeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [demoOriginal, demoRender]);

  // ── File upload logic ──
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const processFile = (f: File) => {
    if (!isSignedIn) return;
    setFile(f);
    setProgress(0);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + PROGRESS_STEP;
          if (next >= 100) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            timeoutRef.current = setTimeout(async () => {
              if (!user || isUploading.current) return;
              isUploading.current = true;
              const name = prompt("Enter a name for your project:");
              if (!name) { isUploading.current = false; return; }
              const res = await fetch("/api/projects", {
                method: "POST",
                body: JSON.stringify({ name, userId: user.id, base64Image: base64 }),
              });
              const project = await res.json();
              isUploading.current = false;
              router.push(`/visualizer/${project._id}`);
            }, REDIRECT_DELAY_MS);
            return 100;
          }
          return next;
        });
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="sh-bg">
      <div className="sh-container">

        {/* Hero Text */}
        <div className="sh-text">
          <h1 className="sh-title sh-title-wrap">
            {/* Invisible full text — reserves exact height, no layout shift */}
            <span className="sh-title-ghost" aria-hidden="true">
              Turn 2D floor plans into <span className="sh-accent">3D renders</span> instantly
            </span>
            {/* Typing animation overlaid on top */}
            <span className="sh-title-typing">
              <TypingTitle />
            </span>
          </h1>
          <p className="sh-subtitle">
            Revolutionize your architectural workflow with AI-powered 3D reconstruction.
            Fast, accurate, and ready for your next project.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="sh-grid">

          {/* Upload Card */}
          <div className="sh-card">
            <div className="sh-card-head">
              <div className="sh-icon-wrap">
                <FileUp size={20} />
              </div>
              <h3 className="sh-card-title">Upload your floor plan</h3>
            </div>

            {!file ? (
              <div
                className={`sh-dropzone${isDragging ? " sh-dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); if (isSignedIn) setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (isSignedIn) { const f = e.dataTransfer.files?.[0]; if (f) processFile(f); } }}
              >
                <input
                  type="file"
                  className="sh-drop-input"
                  accept=".jpg,.jpeg,.png"
                  disabled={!isSignedIn}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
                />
                <div className="sh-drop-icon-wrap">
                  <FileUp size={26} />
                </div>
                <p className="sh-drop-title">Drag and drop your files</p>
                <p className="sh-drop-sub">Supports JPG, PNG, or PDF floor plans</p>
              </div>
            ) : (
              <div className="sh-dropzone sh-uploading">
                <p className="sh-drop-title">{file.name}</p>
                <div className="sh-progress-bar">
                  <div className="sh-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="sh-drop-sub">{progress < 100 ? "Analyzing..." : "Redirecting..."}</p>
              </div>
            )}

            <div className="sh-card-bottom">
              <button
                className="sh-upload-btn"
                onClick={() => !isSignedIn ? openSignUp({ fallbackRedirectUrl: "/dashboard" }) : undefined}
              >
                {isSignedIn ? "Click above to upload" : "Sign in to upload"}
              </button>
              <div className="sh-badges">
                <span className="sh-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Instant AI Analysis
                </span>
                <span className="sh-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Pro Textures
                </span>
              </div>
            </div>
          </div>

          {/* Comparison Card */}
          <div className="sh-card">
            <div className="sh-card-head sh-card-head-between">
              <div className="sh-card-head">
                <div className="sh-icon-wrap">
                  <Box size={20} />
                </div>
                <h3 className="sh-card-title">Before/After Comparison</h3>
              </div>
              <span className="sh-live-badge">Live Preview</span>
            </div>

            <div className="sh-compare">
              {demoOriginal && demoRender ? (
                <ReactCompareSlider
                  position={sliderPos}
                  onPositionChange={setSliderPos}
                  onPointerDown={() => { sliderDragging.current = true; }}
                  onPointerUp={() => { sliderDragging.current = false; }}
                  onPointerLeave={() => { sliderDragging.current = false; }}
                  onMouseEnter={() => { sliderDragging.current = true; }}
                  onMouseLeave={() => { sliderDragging.current = false; }}
                  handle={
                    <ReactCompareSliderHandle
                      buttonStyle={{
                        background: "#fff",
                        border: "none",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
                        color: "#ec5b13",
                      }}
                      linesStyle={{ background: "#fff", width: 2, opacity: 0.7 }}
                    />
                  }
                  style={{ width: "100%", height: "100%" }}
                  itemOne={<ReactCompareSliderImage src={demoOriginal} alt="2D Floor Plan" style={{ objectFit: "cover" }} />}
                  itemTwo={<ReactCompareSliderImage src={demoRender} alt="3D Render" style={{ objectFit: "cover" }} />}
                />
              ) : (
                <div className="sh-compare-empty" />
              )}
              <div className="sh-compare-label sh-label-left">2D BLUEPRINT</div>
              <div className="sh-compare-label sh-label-right">3D RENDER</div>
            </div>

            <div className="sh-card-footer">
              <p>Slide to see the magic: From flat blueprints to immersive 3D environments in seconds.</p>
              <div className="sh-avatars">
                <NextImage src="/avatars/female1.jpg" className="sh-avatar" alt="user" width={32} height={32} priority />
                <NextImage src="/avatars/female2.jpg" className="sh-avatar" alt="user" width={32} height={32} priority />
                <NextImage src="/avatars/av4.jpg" className="sh-avatar" alt="user" width={32} height={32} priority />
                <NextImage src="/avatars/av7.jpg" className="sh-avatar" alt="user" width={32} height={32} priority />
                <div className="sh-avatar sh-av-count">+12k</div>
              </div>
            </div>
          </div>

        </div>

        {/* Trusted by */}
        <div className="sh-trusted">
          <p className="sh-trusted-label">Trusted by top agencies</p>
          <div className="sh-trusted-logos">
            <span>ARCHITECTS.CO</span>
            <span>FLATLY</span>
            <span>RENDERHUB</span>
            <span>PLANSET</span>
          </div>
        </div>

      </div>
    </div>
  );
}
