"use client";

import "./dashboard.css";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowUpRight, FolderOpen } from "lucide-react";
import AutoCompareSlider from "@/components/AutoCompareSlider";
import { type FramesData } from "@/lib/actions";
import { DEFAULT_FALLBACKS } from "@/lib/frameDefaults";

const INPUT_TYPE_META: Record<string, { label: string; desc: string }> = {
  "floor-plan":      { label: "2D Floor Plan → 3D",  desc: "Turn blueprints into photorealistic 3D renders" },
  "interior-design": { label: "Interior Redesign",    desc: "Reimagine any room with AI-powered styling" },
  "outdoor":         { label: "Garden & Yard Design", desc: "Transform your exterior with stunning landscape AI" },
  "empty-room":      { label: "Virtual Staging",      desc: "Stage empty spaces with beautiful AI furniture" },
};

export default function DashboardClient({ frames, displayName }: { frames: FramesData; displayName: string | null }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) router.push("/");
  }, [isLoaded, user]);

  if (!isLoaded || !user) return null;

  return (
    <div className="db-page">
      <DashboardNavbar />

      <main className="db-main">

        {/* Welcome header */}
        <div className="db-welcome">
          <div>
            <h2 className="db-welcome-title">Welcome back, {displayName ?? user.username ?? "there"} 👋</h2>
            <p className="db-welcome-sub">Ready to transform another space today?</p>
          </div>
          <div className="db-welcome-actions">
            <button className="db-btn-ghost" onClick={() => router.push("/projects")}>
              <FolderOpen size={16} />
              My Studio
            </button>
            <button className="db-btn-primary">
              <ArrowUpRight size={16} />
              Upgrade Account
            </button>
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
