"use client";

import "./dashboard.css";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowUpRight, FileText, FolderOpen } from "lucide-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

const INPUT_TYPES = [
  { id: "floor-plan",      imgBefore: "/faq-3d.png",              imgAfter: "/faq-2d.jpg",              label: "2D Floor Plan → 3D",        desc: "Turn blueprints into photorealistic 3D renders" },
  { id: "interior-design", imgBefore: "/card-room-before.webp",   imgAfter: "/card-room-after.webp",    label: "Interior Redesign",          desc: "Reimagine any room with AI-powered styling" },
  { id: "outdoor",         imgBefore: "/card-outdoor-before.avif", imgAfter: "/card-outdoor-after.avif", label: "Outdoor & Garden",           desc: "Transform your exterior with stunning landscape AI" },
  { id: "empty-room",      imgBefore: "/card-empty-before.webp",  imgAfter: "/card-empty-after.webp",   label: "Virtual Staging",            desc: "Stage empty spaces with beautiful AI furniture" },
];

export default function Dashboard() {
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
            <h2 className="db-welcome-title">Welcome back, {user.username ?? "there"} 👋</h2>
            <p className="db-welcome-sub">Ready to transform another space today?</p>
          </div>
          <div className="db-welcome-actions">
            <button className="db-btn-ghost" onClick={() => router.push("/projects")}>
              <FolderOpen size={16} />
              My Projects
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
            {INPUT_TYPES.map((t) => (
              <div
                key={t.id}
                className="nr-type-card"
                onClick={() => router.push(`/visualizer/new?type=${t.id}`)}
              >
                <div className="nr-reveal-container" onClick={(e) => e.stopPropagation()}>
                  <ReactCompareSlider
                    itemOne={<ReactCompareSliderImage src={t.imgBefore} alt="Before" style={{ objectFit: "cover" }} />}
                    itemTwo={<ReactCompareSliderImage src={t.imgAfter} alt="After" style={{ objectFit: "cover" }} />}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                <div className="nr-type-info">
                  <div>
                    <h3 className="nr-type-label">{t.label}</h3>
                    <p className="nr-type-desc">{t.desc}</p>
                  </div>
                  <span className="nr-type-cta">Try it →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
