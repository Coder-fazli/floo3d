"use client";

import "./dashboard.css";
import AppSidebar from "@/components/AppSidebar";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowUpRight, FolderOpen, Sparkles, X } from "lucide-react";
import AutoCompareSlider from "@/components/AutoCompareSlider";
import { type FramesData, getUserInfo, saveUserCountry } from "@/lib/actions";
import { DEFAULT_FALLBACKS } from "@/lib/frameDefaults";
import { Zap } from "lucide-react";

const INPUT_TYPE_META: Record<string, { label: string; desc: string; hint: string }> = {
  "floor-plan":           { label: "Blueprint → 3D",       desc: "Upload a floor plan blueprint to get a photorealistic 3D render", hint: "📐 Upload: a blueprint or floor plan drawing" },
  "floor-plan-generator": { label: "Floor Plan Generator",  desc: "Generate a custom floor plan from scratch with AI",              hint: "✏️ No upload needed — just describe your space" },
  "interior-design":      { label: "Interior Redesign",     desc: "Reimagine any room with AI-powered styling",                    hint: "📷 Upload: a photo of an existing room" },
  "outdoor":              { label: "Garden & Yard Design",  desc: "Transform your exterior with stunning landscape AI",             hint: "📷 Upload: a photo of your garden or yard" },
  "empty-room":           { label: "Virtual Staging",       desc: "Stage empty spaces with beautiful AI furniture",                 hint: "📷 Upload: a photo of an empty room" },
};

export default function DashboardClient({ frames, displayName }: { frames: FramesData; displayName: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [showSuccess, setShowSuccess] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserInfo(user.id).then(d => setCredits(d.credits ?? 0));
    // Detect country client-side (works in dev + production)
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => { if (d?.country_code) saveUserCountry(user.id, d.country_code); })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (isLoaded && !user) router.push("/");
  }, [isLoaded, user]);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      setShowSuccess(true);
      // Remove ?success=1 from URL without reload
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  if (!isLoaded || !user) return null;

  return (
    <div className="db-page">
      <AppSidebar />

      {showSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '1.25rem',
            padding: '2.5rem 2rem', maxWidth: '420px', width: '100%',
            textAlign: 'center', position: 'relative',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          }}>
            <button onClick={() => setShowSuccess(false)} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '2rem', height: '2rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
            }}><X size={14} /></button>

            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(236,91,19,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
            }}>
              <Sparkles size={28} style={{ color: '#ec5b13' }} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Credits Added! 🎉
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
              Your purchase was successful. Your credits have been added to your account — start generating right away.
            </p>

            <button
              onClick={() => { setShowSuccess(false); router.push("/visualizer/new"); }}
              style={{
                width: '100%', padding: '0.75rem', background: '#ec5b13',
                color: '#fff', border: 'none', borderRadius: '0.75rem',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Start Generating →
            </button>
          </div>
        </div>
      )}

      <main className="db-main">

        {/* Welcome header */}
        <div className="db-welcome">
          <div>
            <h2 className="db-welcome-title">Welcome back, {displayName ?? user.username ?? "there"} 👋</h2>
            <p className="db-welcome-sub">Ready to transform another space today?</p>
          </div>
          <div className="db-welcome-actions">
            {/* Desktop buttons */}
            <button className="db-btn-ghost db-desktop-only" onClick={() => router.push("/projects")}>
              <FolderOpen size={16} />
              My Studio
            </button>
            <button className="db-btn-primary db-desktop-only" onClick={() => window.open("/pricing", "_blank")}>
              <ArrowUpRight size={16} />
              Upgrade Account
            </button>
            {/* Mobile: credits + Upgrade word */}
            <div className="db-mob-credits db-mobile-only">
              <Zap size={13} />
              {credits ?? "—"} credits
            </div>
            <a className="db-mob-upgrade db-mobile-only" href="/pricing">Upgrade</a>
          </div>
        </div>

        {/* Input Type Selection */}
        <section className="nr-section">
          <div className="nr-section-head">
            <div className="nr-step-num">→</div>
            <h2 className="nr-section-title">Choose a transformation</h2>
          </div>
          <div className="nr-type-grid">
            {Object.keys(INPUT_TYPE_META).map((id) => {
              const def = DEFAULT_FALLBACKS[id];
              const saved = frames.fallbacks[id] ?? {};
              const imgBefore = saved.before ?? def.before;
              const imgAfter  = saved.after  ?? def.after;
              const { label, desc } = INPUT_TYPE_META[id];
              return (
                <div
                  key={id}
                  className="nr-type-card"
                  onClick={() => router.push(`/visualizer/new?type=${id}`)}
                >
                  <div className="nr-reveal-container">
                    <AutoCompareSlider before={imgBefore} after={imgAfter} />
                    {/* Mobile only: gradient + overlaid text */}
                    <div className="nr-card-gradient" />
                    <div className="nr-card-overlay-info">
                      <div>
                        <h3 className="nr-type-label">{label}</h3>
                        <p className="nr-type-desc">{desc}</p>
                      </div>
                      <span className="nr-type-cta">Try Now</span>
                    </div>
                  </div>
                  {/* Desktop only: text below */}
                  <div className="nr-type-info">
                    <div>
                      <h3 className="nr-type-label">{label}</h3>
                      <p className="nr-type-desc">{desc}</p>
                    </div>
                    <span className="nr-type-cta">Try it →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
