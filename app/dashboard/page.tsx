"use client";

import "./dashboard.css";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowUpRight, FileText, FolderOpen } from "lucide-react";

const INPUT_TYPES = [
  { id: "floor-plan",      imgBefore: "/faq-3d.png",              imgAfter: "/faq-2d.jpg",              label: "2D Floor Plan to 3D",  desc: "Blueprint to 3D architectural render" },
  { id: "interior-design", imgBefore: "/card-room-after.webp",    imgAfter: "/card-room-before.webp",   label: "Interior Design",      desc: "Redesign any room with AI" },
  { id: "outdoor",         imgBefore: "/card-outdoor-before.avif", imgAfter: "/card-outdoor-after.avif", label: "Outdoor / Garden",     desc: "Exterior & garden design" },
  { id: "empty-room",      imgBefore: "/card-empty-after.webp",   imgAfter: "/card-empty-before.webp",  label: "Empty the Room",       desc: "Clear furniture instantly to plan new layouts." },
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
                <div className="nr-reveal-container">
                  <div className="nr-reveal-before" style={{ backgroundImage: `url(${t.imgBefore})` }}>
                    <div className="nr-reveal-before-overlay" />
                  </div>
                  <div className="nr-reveal-after" style={{ backgroundImage: `url(${t.imgAfter})` }} />
                </div>
                <div>
                  <h3 className="nr-type-label">{t.label}</h3>
                  <p className="nr-type-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
