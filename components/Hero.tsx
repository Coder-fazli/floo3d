"use client";

import "./Hero.css";
import { Layers } from "lucide-react";
import Upload from "@/components/Upload";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { useEffect, useRef, useState } from "react";

interface HeroProps {
  onUploadComplete: (base64Image: string) => void;
  demoOriginal?: string;
  demoRender?: string;
}

export default function Hero({ onUploadComplete, demoOriginal, demoRender }: HeroProps) {
  const [sliderPos, setSliderPos] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!demoOriginal || !demoRender) return;
    // Wait 800ms after load, then smoothly animate 0 → 50
    const timeout = setTimeout(() => {
      const start = performance.now();
      const duration = 1400; // ms

      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setSliderPos(Math.round(eased * 50));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, 800);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [demoOriginal, demoRender]);

  return (
    <section className="hero">
      <div className="hero-head">
        <h1>Turn 2D floor plans into 3D renders instantly</h1>
      </div>

      <div className="hero-inner">

        {/* ── Left: upload ── */}
        <div className="hero-left">
          <div className="hero-upload-shell" id="upload">
            <div className="grid-overlay" />
            <div className="hero-upload-card">
              <div className="hero-upload-head">
                <div className="upload-icon">
                  <Layers className="icon" />
                </div>
                <h3>Upload your floor plan</h3>
                <p>Supports JPG, PNG — up to 10MB</p>
              </div>
              <Upload onComplete={onUploadComplete} />
            </div>
          </div>
        </div>

        {/* ── Right: demo comparison slider ── */}
        <div className="hero-right">
          <div className="demo-card">
            {demoOriginal && demoRender ? (
              <>
                <div className="demo-labels">
                  <span className="demo-label">2D</span>
                  <span className="demo-label">3D</span>
                </div>
                <ReactCompareSlider
                  position={sliderPos}
                  onPositionChange={setSliderPos}
                  style={{ width: "100%", height: "100%", borderRadius: "1.25rem", overflow: "hidden" }}
                  itemOne={
                    <ReactCompareSliderImage
                      src={demoOriginal}
                      alt="2D Floor Plan"
                      style={{ objectFit: "cover" }}
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={demoRender}
                      alt="3D Render"
                      style={{ objectFit: "cover" }}
                    />
                  }
                />
                <div className="demo-drag-hint">
                  <span>← Drag to Compare →</span>
                </div>
              </>
            ) : (
              <div className="demo-placeholder">
                <p>Generating demo...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
