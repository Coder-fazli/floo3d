"use client";

import "./dashboard.css";
import DashboardNavbar from "@/components/DashboardNavbar";
import Upload from "@/components/Upload";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getProjects, getCredits } from "@/lib/actions";
import { CloudUpload, Calendar, Eye, ArrowUpRight, FileText, Wallet, X, CreditCard, Rocket } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "recent">("all");
  const [visible, setVisible] = useState(8);
  const [credits, setCredits] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const isUploading = useRef(false);

  const noCredits = credits !== null && credits === 0;

  useEffect(() => {
    if (user) {
      getProjects(user.id).then(setProjects);
      getCredits(user.id).then((c) => {
        setCredits(c);
        if (c === 0) setShowBanner(true);
      });
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && !user) router.push("/");
  }, [isLoaded, user]);

  if (!isLoaded || !user) return null;

  const handleUploadComplete = async (base64Image: string) => {
    if (!user || isUploading.current) return;
    isUploading.current = true;
    const name = prompt("Enter a name for your project:");
    if (!name) { isUploading.current = false; return; }
    const res = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, userId: user.id, base64Image }),
    });
    const project = await res.json();
    isUploading.current = false;
    router.push(`/visualizer/${project._id}`);
  };

  const sorted = filter === "recent"
    ? [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : projects;
  const displayed = sorted.slice(0, visible);

  return (
    <div className="db-page">
      <DashboardNavbar />

      {showBanner && (
        <div className="db-banner-wrap">
          <div className="db-banner">
            <div className="db-banner-left">
              <div className="db-banner-icon">
                <Wallet size={20} />
              </div>
              <div>
                <h4 className="db-banner-title">Out of Credits</h4>
                <p className="db-banner-text">
                  You have reached your limit of 3D renders. Upgrade your plan to continue transforming floor plans.
                </p>
              </div>
            </div>
            <div className="db-banner-right">
              <button className="db-banner-upgrade">Upgrade Now</button>
              <button className="db-banner-close" onClick={() => setShowBanner(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="db-banner-blur" />
          </div>
        </div>
      )}

      <main className="db-main">

        {/* Welcome header */}
        <div className="db-welcome">
          <div>
            <h2 className="db-welcome-title">Welcome back, {user.firstName ?? "there"} 👋</h2>
            <p className="db-welcome-sub">Ready to transform another floor plan today?</p>
          </div>
          <div className="db-welcome-actions">
            <button className="db-btn-ghost">
              <FileText size={16} />
              Documentation
            </button>
            <button className="db-btn-primary">
              <ArrowUpRight size={16} />
              Upgrade Account
            </button>
          </div>
        </div>

        {/* Upload zone */}
        {noCredits ? (
          <div className="db-upload-error">
            <div className="db-upload-error-bar" />
            <div className="db-upload-error-inner">
              <div className="db-upload-error-icon">
                <CreditCard size={40} />
              </div>
              <h3 className="db-upload-error-title">Insufficient Credits</h3>
              <p className="db-upload-error-desc">
                You've reached your credit limit. Please{" "}
                <span className="db-upload-error-link">upgrade your plan</span>{" "}
                to continue transforming floor plans.
              </p>
              <div className="db-upload-error-btns">
                <button className="db-upload-error-btn-primary">
                  <Rocket size={16} /> Upgrade Now
                </button>
                <button className="db-upload-error-btn-secondary">
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="db-upload-zone">
            <div className="db-upload-icon-wrap">
              <CloudUpload size={36} className="db-upload-icon" />
            </div>
            <h3 className="db-upload-title">Upload Floor Plan</h3>
            <p className="db-upload-desc">
              Drag and drop your 2D plans (JPG, PNG) here to start the 3D conversion.{" "}
              <strong>Max file size: 10MB.</strong>
            </p>
            <Upload onComplete={handleUploadComplete} />
          </div>
        )}

        {/* Projects section */}
        <section className="db-projects">
          <div className="db-projects-head">
            <h3 className="db-projects-title">Your Projects</h3>
            <div className="db-filter-tabs">
              <button
                className={`db-filter-tab ${filter === "all" ? "db-filter-active" : ""}`}
                onClick={() => setFilter("all")}
              >All</button>
              <button
                className={`db-filter-tab ${filter === "recent" ? "db-filter-active" : ""}`}
                onClick={() => setFilter("recent")}
              >Recent</button>
            </div>
          </div>

          {displayed.length === 0 ? (
            <div className="db-empty">No projects yet. Upload a floor plan above to get started.</div>
          ) : (
            <div className="db-grid">
              {displayed.map(({ _id, name, renderedImageUrl, originalImageUrl, createdAt }) => (
                <div key={_id} className="db-card" onClick={() => router.push(`/visualizer/${_id}`)}>
                  <div className="db-card-img-wrap">
                    <img
                      src={renderedImageUrl || originalImageUrl}
                      alt={name || "Project"}
                      className="db-card-img"
                    />
                    <div className="db-card-overlay">
                      <button className="db-overlay-btn" onClick={(e) => { e.stopPropagation(); router.push(`/visualizer/${_id}`); }}>
                        <Eye size={16} />
                      </button>
                    </div>
                    <span className={`db-badge ${renderedImageUrl ? "db-badge-done" : "db-badge-processing"}`}>
                      {renderedImageUrl ? "Completed" : "Processing"}
                    </span>
                  </div>
                  <div className="db-card-body">
                    <h4 className="db-card-name">{name}</h4>
                    <div className="db-card-meta">
                      <Calendar size={11} />
                      <span>{new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sorted.length > visible && (
            <div className="db-load-more">
              <button className="db-load-more-btn" onClick={() => setVisible(v => v + 8)}>
                Load More Projects
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
