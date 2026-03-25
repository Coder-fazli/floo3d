"use client";

import "./visualizer.css";
import NextImage from "next/image";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProject } from "@/lib/actions";
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from "react-compare-slider";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import SocialButton from "@/components/kokonutui/social-button";
import Image from "next/image";
import Link from "next/link";
import { Download, RefreshCcw, Maximize2, ZoomIn, ZoomOut, Clock, ChevronRight, Upload as UploadIcon, Home, Zap, Sparkles } from "lucide-react";
import NameProjectModal from "@/components/NameProjectModal";
import { BubbleBackground } from "@/components/animate-ui/components/backgrounds/bubble";

const STYLES: Record<string, string[]> = {
  "floor-plan":      ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"],
  "interior-design": ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"],
  "outdoor":         ["Mediterranean", "Japanese", "Tropical", "Cottage", "Modern", "Desert"],
  "empty-room":      ["Clean"],
};

const FALLBACK_IMAGES: Record<string, { before: string; after: string; labelBefore: string; labelAfter: string }> = {
  "floor-plan":      { before: "/real-2d-plan.jpg",         after: "/real-3d-render.jpg",      labelBefore: "Original 2D Plan", labelAfter: "AI 3D Render" },
  "interior-design": { before: "/card-room-before.webp",    after: "/card-room-after.webp",    labelBefore: "Original Room",    labelAfter: "AI Redesigned" },
  "outdoor":         { before: "/card-outdoor-before.avif", after: "/card-outdoor-after.avif", labelBefore: "Original Outdoor", labelAfter: "AI Outdoor Design" },
  "empty-room":      { before: "/card-empty-before.webp",   after: "/card-empty-after.webp",   labelBefore: "Furnished Room",   labelAfter: "Emptied Room" },
};

const STYLE_IMAGES: Record<string, string> = {
  "Modern":        "/card-room-after.webp",
  "Scandinavian":  "/hero-after.jpg",
  "Industrial":    "/real-3d-render.jpg",
  "Rustic":        "/card-empty-after.webp",
  "Luxury":        "/real-3d-render.jpg",
  "Minimalist":    "/card-room-before.webp",
  "Mediterranean": "/card-outdoor-after.webp",
  "Japanese":      "/card-room-after.webp",
  "Tropical":      "/card-outdoor-before.avif",
  "Cottage":       "/card-empty-before.webp",
  "Desert":        "/hero-before.jpg",
  "Clean":         "/card-empty-after.webp",
};

const ROOM_TYPES = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Dining Room", "Studio", "Hallway"];

export default function VisualizerClient() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useUser();

  const isNewMode = id === "new";

  const hasInitialGenerated = useRef(false);
  const [project, setProject] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [modalType, setModalType] = useState<"error" | "credits" | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sidebar state
  const [renderStyle, setRenderStyle] = useState("Modern");
  const [roomType, setRoomType] = useState("Living Room");
  const [inputTypeNew, setInputTypeNew] = useState("floor-plan");
  const [isCreating, setIsCreating] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const pendingFileBase64Ref = useRef<string | null>(null);

  const zoomIn  = () => setZoomLevel(z => parseFloat(Math.min(z + 0.25, 3).toFixed(2)));
  const zoomOut = () => setZoomLevel(z => parseFloat(Math.max(z - 0.25, 0.5).toFixed(2)));

  // Read type from URL for new mode
  useEffect(() => {
    if (isNewMode) {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("type") ?? "floor-plan";
      setInputTypeNew(t);
      setRenderStyle(STYLES[t]?.[0] ?? "Modern");
    }
  }, [isNewMode]);

  // Sync local renderStyle when project loads
  useEffect(() => {
    if (project?.renderStyle) setRenderStyle(project.renderStyle);
  }, [project?.renderStyle]);

  useEffect(() => {
    if (!isNewMode && id) getProject(id as string).then(setProject);
  }, [id, isNewMode]);

  const runGeneration = async () => {
    if (isProcessing) return;
    if (!project) return;
    if (!project?._id || !project?.originalImageUrl || !user?.id) {
      console.error("Missing required data");
      return;
    }

    let res: Response | null = null;
    try {
      setIsProcessing(true);
      res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project._id,
          imageUrl: project.originalImageUrl,
          userId: user?.id,
          inputType: project.inputType ?? "floor-plan",
          renderStyle,
          roomType,
        }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      if (!data?.renderedImageUrl) throw new Error("Invalid response from API");
      setCurrentImage(data.renderedImageUrl);
    } catch (error: any) {
      if (res?.status === 403) {
        setModalType("credits");
      } else {
        setModalType("error");
      }
      console.error("Generation failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!project || hasInitialGenerated.current) return;
    hasInitialGenerated.current = true;
    if (project.renderedImageUrl) {
      setCurrentImage(project.renderedImageUrl);
    }
  }, [project]);

  // Handle upload in sidebar
  const sidebarFileRef = useRef<HTMLInputElement>(null);

  const handleSidebarFile = (file: File) => {
    if (!user || isCreating) return;
    const MAX_BYTES = 10 * 1024 * 1024;
    if (!["image/jpeg", "image/png"].includes(file.type)) return;
    if (file.size > MAX_BYTES) return;

    const reader = new FileReader();
    reader.onload = () => {
      pendingFileBase64Ref.current = reader.result as string;
      setNameModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleNameConfirm = async (name: string) => {
    setNameModalOpen(false);
    const base64 = pendingFileBase64Ref.current;
    if (!base64 || !user) return;
    setIsCreating(true);
    const inputType = isNewMode ? inputTypeNew : (project?.inputType ?? "floor-plan");
    const res = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, userId: user.id, base64Image: base64, inputType, renderStyle }),
    });
    const newProject = await res.json();
    setIsCreating(false);
    pendingFileBase64Ref.current = null;
    setProject(newProject);
    hasInitialGenerated.current = false;
    window.history.replaceState(null, "", `/visualizer/${newProject._id}`);
  };

  const handleNameCancel = () => {
    setNameModalOpen(false);
    pendingFileBase64Ref.current = null;
  };

  const handleExport = async () => {
    if (!currentImage) return;
    const response = await fetch(currentImage);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project?.name || "render"}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/visualizer/${id}`;
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/visualizer/${id}` : "";

  const activeInputType = isNewMode ? inputTypeNew : (project?.inputType ?? "floor-plan");
  const styleList = STYLES[activeInputType] ?? STYLES["floor-plan"];

  return (
    <div className="viz-page">

      {/* Navbar */}
      <header className="viz-nav">
        <div className="viz-nav-inner">
          <div className="viz-nav-left">
            <Link href="/dashboard" className="viz-brand">
              <div className="viz-brand-icon">
                <Image src="/logo.png" alt="Floo3D" width={20} height={20} />
              </div>
              <span className="viz-brand-name">Floo<span className="viz-brand-accent">3D</span></span>
            </Link>
            <nav className="viz-breadcrumb">
              <Link href="/dashboard" className="viz-breadcrumb-link">Dashboard</Link>
              <ChevronRight size={14} className="viz-breadcrumb-sep" />
              <span className="viz-breadcrumb-current">{isNewMode ? "New Project" : (project?.name || "Project")}</span>
            </nav>
          </div>

          <div className="viz-nav-right">
            <div className="viz-nav-avatar">
              {user?.imageUrl ? (
                <NextImage src={user.imageUrl} alt="avatar" width={32} height={32} />
              ) : (
                <span className="viz-nav-avatar-fallback">{user?.firstName?.[0] ?? "U"}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="viz-main">

        {/* Project header */}
        <div className="viz-project-head">
          <div>
            <div className="viz-project-meta">
              <span className={`viz-status-badge ${!currentImage ? "viz-status-badge-processing" : ""}`}>
                {isNewMode ? "New Project" : currentImage ? "3D Render Ready" : isProcessing ? "Processing" : "Pending"}
              </span>
              {!isNewMode && (
                <span className="viz-project-date">
                  Created {project?.createdAt ? new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </span>
              )}
            </div>
            <h2 className="viz-project-title">{isNewMode ? "New Project" : (project?.name || "Untitled Project")}</h2>
            <p className="viz-project-sub">Created by {user?.fullName ?? "You"}</p>
          </div>

          <div className="viz-stats-row">
            <div className="viz-stat-card" style={{ cursor: "pointer", borderColor: "#ec5b13" }} onClick={() => router.push("/dashboard")}>
              <div className="viz-stat-icon" style={{ color: "#ec5b13" }}><RefreshCcw size={18} /></div>
              <div>
                <p className="viz-stat-label">Navigate</p>
                <p className="viz-stat-value" style={{ color: "#ec5b13" }}>Back to Dashboard</p>
              </div>
            </div>
            <div className="viz-stat-card" style={{ gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="viz-btn-primary" onClick={handleExport} disabled={!currentImage} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
                  <Download size={14} /> Export
                </button>
                <SocialButton shareUrl={shareUrl} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <p className="viz-stat-label" style={{ margin: 0 }}>Share:</p>
                <a href="#" className="viz-share-icon" onClick={handleShare} title="Copy link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="viz-share-icon" title="Share on X">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="viz-share-icon" title="Share on LinkedIn">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            <div className="viz-stat-card">
              <div className="viz-stat-icon"><Clock size={18} /></div>
              <div>
                <p className="viz-stat-label">AI Model</p>
                <p className="viz-stat-value">Floo3D v2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace: sidebar + output */}
        <div className="viz-workspace">

          {/* Sidebar */}
          <aside className="viz-sidebar">

            {/* Upload */}
            <div className="viz-sb-section">
              <div className="viz-sb-section-title">
                <UploadIcon size={13} strokeWidth={2.5} style={{ color: "#ec5b13" }} />
                Upload Your Image
              </div>
              <div
                className="viz-sb-upload"
                onClick={() => sidebarFileRef.current?.click()}
              >
                <input
                  ref={sidebarFileRef}
                  type="file"
                  accept=".jpg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSidebarFile(f); e.target.value = ""; }}
                />
                <UploadIcon size={24} style={{ color: "#ec5b13", strokeWidth: 1.5 }} />
                <span className="viz-sb-upload-title">
                  {isCreating ? "Creating project…" : "Click to upload or drag & drop"}
                </span>
                <span className="viz-sb-upload-sub">PNG, JPG · Max 10MB</span>
              </div>
            </div>

            {/* Room Type */}
            <div className="viz-sb-section">
              <div className="viz-sb-section-title">
                <Home size={13} strokeWidth={2.5} style={{ color: "#ec5b13" }} />
                Room Type
              </div>
              <select
                className="viz-room-select"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                {ROOM_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>

            {/* Design Style */}
            <div className="viz-sb-section viz-sb-section-grow">
              <div className="viz-sb-section-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ec5b13" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                Design Style
              </div>
              <div className="viz-style-scroll">
                <div className="viz-style-grid">
                  {styleList.map((s) => (
                    <div
                      key={s}
                      className={`viz-style-card${renderStyle === s ? " viz-style-card-active" : ""}`}
                      onClick={() => setRenderStyle(s)}
                    >
                      <div className="viz-style-card-img">
                        <img src={STYLE_IMAGES[s] ?? "/card-room-after.webp"} alt={s} />
                        {renderStyle === s && (
                          <div className="viz-style-card-check">
                            <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="viz-style-card-label">{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate */}
            <div className="viz-generate-wrap">
              <button
                className="viz-generate-btn"
                onClick={runGeneration}
                disabled={isProcessing || isNewMode || !project || (!!currentImage && renderStyle === project?.renderStyle)}
              >
                <Zap size={15} strokeWidth={2.5} />
                {isProcessing ? "Generating…" : currentImage ? "Regenerate" : "Generate"}
              </button>
              <div className="viz-credit-note">
                ⚡ Uses <span>3 credits</span> per generation
              </div>
            </div>

          </aside>

          {/* Output card */}
          <div className="viz-output-card">
            <div className="viz-output-head">
              <span className="viz-output-title">Preview</span>
              <div className="viz-output-actions">
                <button className="viz-download-btn" onClick={handleExport} disabled={!currentImage}>
                  <Download size={12} strokeWidth={2.5} />
                  <span>Download Ultra HD</span>
                  <div className="viz-download-shimmer" />
                </button>
                <button className="viz-icon-btn" onClick={() => setLightboxOpen(true)} disabled={!currentImage} title="Fullscreen">
                  <Maximize2 size={13} />
                </button>
                <button className="viz-icon-btn" title="Zoom out" onClick={zoomOut} disabled={zoomLevel <= 0.5}>
                  <ZoomOut size={13} />
                </button>
                <span className="viz-zoom-label">{Math.round(zoomLevel * 100)}%</span>
                <button className="viz-icon-btn" title="Zoom in" onClick={zoomIn} disabled={zoomLevel >= 3}>
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>

            {/* Comparison slider */}
            <div className="viz-compare-wrap" style={{ overflow: "hidden" }}>
              {project?.originalImageUrl && currentImage ? (
                <ReactCompareSlider
                  defaultValue={50}
                  style={{ width: "100%", height: "100%", transform: `scale(${zoomLevel})`, transformOrigin: "center", transition: "transform 0.3s ease" }}
                  handle={
                    <ReactCompareSliderHandle
                      buttonStyle={{
                        background: "#fff",
                        border: "none",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
                        color: "#ec5b13",
                      }}
                      linesStyle={{ background: "#ec5b13", width: 3, opacity: 0.9 }}
                    />
                  }
                  itemOne={
                    <ReactCompareSliderImage
                      src={project.originalImageUrl}
                      alt="Original"
                      style={{ objectFit: "cover" }}
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={currentImage}
                      alt="Result"
                      style={{ objectFit: "cover", cursor: "zoom-in" }}
                      onClick={() => setLightboxOpen(true)}
                    />
                  }
                />
              ) : project?.originalImageUrl ? (
                <NextImage src={project.originalImageUrl} alt="Original" fill style={{ objectFit: "cover" }} />
              ) : (() => {
                const fb = FALLBACK_IMAGES[activeInputType] ?? FALLBACK_IMAGES["floor-plan"];
                return (
                  <>
                    <ReactCompareSlider
                      defaultValue={50}
                      style={{ width: "100%", height: "100%" }}
                      handle={
                        <ReactCompareSliderHandle
                          buttonStyle={{ background: "#fff", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,0.25)", color: "#ec5b13" }}
                          linesStyle={{ background: "#ec5b13", width: 3, opacity: 0.9 }}
                        />
                      }
                      itemOne={<ReactCompareSliderImage src={fb.before} alt="Before" style={{ objectFit: "cover" }} />}
                      itemTwo={<ReactCompareSliderImage src={fb.after}  alt="After"  style={{ objectFit: "cover" }} />}
                    />
                    <div className="viz-compare-label viz-label-left">{fb.labelBefore}</div>
                    <div className="viz-compare-label viz-label-right">{fb.labelAfter}</div>
                    <div className="viz-fallback-hint">
                      <UploadIcon size={14} style={{ color: "#ec5b13" }} />
                      Upload your image to replace this example
                    </div>
                  </>
                );
              })()}

              {/* Labels */}
              {currentImage && project?.originalImageUrl && (
                <>
                  <div className="viz-compare-label viz-label-left">
                    {project?.inputType === "interior-design" ? "Original Room" :
                     project?.inputType === "outdoor"         ? "Original Outdoor" :
                     project?.inputType === "empty-room"      ? "Furnished Room" :
                     "Original 2D Plan"}
                  </div>
                  <div className="viz-compare-label viz-label-right">
                    {project?.inputType === "interior-design" ? "AI Redesigned" :
                     project?.inputType === "outdoor"         ? "AI Outdoor Design" :
                     project?.inputType === "empty-room"      ? "Emptied Room" :
                     "AI 3D Render"}
                  </div>
                </>
              )}

              {isProcessing && (
                <div className="viz-processing">
                  <BubbleBackground
                    className="absolute inset-0"
                    colors={{
                      first:  "236,91,19",
                      second: "180,40,0",
                      third:  "255,140,60",
                      fourth: "120,20,0",
                      fifth:  "255,100,30",
                      sixth:  "200,60,10",
                    }}
                  />
                  <div className="viz-processing-card">
                    <div className="viz-processing-icon">
                      <Sparkles size={28} />
                    </div>
                    <p className="viz-processing-title">Generating your render…</p>
                    <p className="viz-processing-sub">This usually takes under a minute</p>
                    <div className="viz-processing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {modalType && (
        <div className="viz-modal-backdrop">
          <div className="viz-modal">
            <div className="viz-modal-body">
              <div className={`viz-modal-icon ${modalType === "credits" ? "viz-modal-icon-credits" : ""}`}>
                {modalType === "credits" ? (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                )}
              </div>
              <h3 className="viz-modal-title">
                {modalType === "credits" ? "Out of Credits" : "Generation Failed"}
              </h3>
              <p className="viz-modal-text">
                {modalType === "credits"
                  ? "You have reached your limit of 3D renders. Upgrade your plan to continue transforming floor plans."
                  : "Something went wrong while processing your render. Please try again or contact support if the problem persists."}
              </p>
            </div>
            <div className="viz-modal-actions">
              {modalType === "credits" ? (
                <>
                  <button className="viz-modal-btn-primary" onClick={() => router.push("/dashboard")}>
                    Upgrade Now
                  </button>
                  <button className="viz-modal-btn-secondary" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button className="viz-modal-btn-primary" onClick={() => { setModalType(null); runGeneration(); }}>
                    Try Again
                  </button>
                  <button className="viz-modal-btn-secondary" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {currentImage && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: currentImage }]}
        />
      )}

      <NameProjectModal
        open={nameModalOpen}
        onConfirm={handleNameConfirm}
        onCancel={handleNameCancel}
      />
    </div>
  );
}
