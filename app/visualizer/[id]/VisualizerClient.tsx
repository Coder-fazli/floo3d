"use client";

import "./visualizer.css";
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
import { Download, RefreshCcw, Maximize2, ZoomIn, Layers, Clock, ChevronRight, Edit } from "lucide-react";

export default function VisualizerClient() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useUser();

  const hasInitialGenerated = useRef(false);
  const [project, setProject] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [modalType, setModalType] = useState<"error" | "credits" | null>(null);

  useEffect(() => {
    if (id) getProject(id as string).then(setProject);
  }, [id]);
 

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
        headers: {
         "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project._id,
          imageUrl: project.originalImageUrl,
          userId: user?.id,
        }),
      });
       
       if (!res.ok) {
        throw new Error (`Request failed with status ${res.status}`);
       }
       
      const data = await res.json();
         if (!data?.renderedImageUrl) {
          throw new Error("Invalid response from API");
         }
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
    if (!project || !user || hasInitialGenerated.current) return;
    hasInitialGenerated.current = true;
    if (project.renderedImageUrl) {
      setCurrentImage(project.renderedImageUrl);
    } else {
      runGeneration();
    }
  }, [project, user]);

  const handleExport = async () => {
    if (!currentImage) return;
    const response = await fetch(currentImage);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project?.name || "floo3d-render"}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/visualizer/${id}`;
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/visualizer/${id}` : "";

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
              <span className="viz-breadcrumb-current">{project?.name || "Project"}</span>
            </nav>
          </div>

          <div className="viz-nav-right">
            <button className="viz-nav-btn">
              <Edit size={15} /> Edit Project
            </button>
            <div className="viz-nav-divider" />
            <div className="viz-nav-avatar">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="avatar" />
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
                {currentImage ? "3D Render Ready" : isProcessing ? "Processing" : "Pending"}
              </span>
              <span className="viz-project-date">
                Created {project?.createdAt ? new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </span>
            </div>
            <h2 className="viz-project-title">{project?.name || "Untitled Project"}</h2>
            <p className="viz-project-sub">Created by You</p>
          </div>

          <div className="viz-stats-row">
            <div className="viz-stat-card">
              <div className="viz-stat-icon"><Layers size={18} /></div>
              <div>
                <p className="viz-stat-label">Status</p>
                <p className="viz-stat-value">{currentImage ? "Complete" : isProcessing ? "Rendering" : "Pending"}</p>
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

        {/* Comparison slider */}
        <div className="viz-compare-wrap">
          {project?.originalImageUrl && currentImage ? (
            <ReactCompareSlider
              defaultValue={50}
              style={{ width: "100%", height: "100%" }}
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
                  alt="2D Floor Plan"
                  style={{ objectFit: "contain", background: "#f8fafc" }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={currentImage}
                  alt="3D Render"
                  style={{ objectFit: "contain", background: "#f8fafc", cursor: "zoom-in" }}
                  onClick={() => setLightboxOpen(true)}
                />
              }
            />
          ) : project?.originalImageUrl ? (
            <img src={project.originalImageUrl} alt="Original" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : null}

          <div className="viz-compare-label viz-label-left">Original 2D Plan</div>
          <div className="viz-compare-label viz-label-right">AI 3D Render</div>

          <div className="viz-compare-toolbar">
            <button className="viz-toolbar-btn" onClick={() => setLightboxOpen(true)} title="Fullscreen">
              <Maximize2 size={16} />
            </button>
            <button className="viz-toolbar-btn" title="Zoom">
              <ZoomIn size={16} />
            </button>
          </div>

          {isProcessing && (
            <div className="viz-processing">
              <div className="viz-processing-card">
                <RefreshCcw size={28} className="viz-spinner" />
                <p className="viz-processing-title">Generating your 3D render...</p>
                <p className="viz-processing-sub">This usually takes under a minute</p>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar row */}
        <div className="viz-toolbar-row">

          {/* Actions card */}
          <div className="viz-actions-card">
            <div className="viz-action-btns">
              <button className="viz-btn-primary" onClick={handleExport} disabled={!currentImage}>
                <Download size={16} /> Export
              </button>
              <SocialButton shareUrl={shareUrl} />
            </div>
            <div className="viz-quick-share">
              <p className="viz-quick-share-label">Quick Share:</p>
              <a href="#" className="viz-share-icon" onClick={handleShare} title="Copy link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="viz-share-icon" title="Share on X">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="viz-share-icon" title="Share on LinkedIn">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Insights card */}
          <div className="viz-insights-card">
            <h3 className="viz-insights-title">Project Insights</h3>
            <div className="viz-insights-list">
              <div className="viz-insights-row">
                <span className="viz-insights-key">Processing Time</span>
                <span className="viz-insights-val">~42 seconds</span>
              </div>
              <div className="viz-insights-row">
                <span className="viz-insights-key">Texture Quality</span>
                <span className="viz-insights-val">4K Ultra HD</span>
              </div>
              <div className="viz-insights-row">
                <span className="viz-insights-key">AI Model</span>
                <span className="viz-insights-val">Floo3D v2.4</span>
              </div>
            </div>
            <hr className="viz-insights-divider" />
            <button className="viz-history-btn" onClick={() => router.push("/dashboard")}>
              <RefreshCcw size={14} /> Back to Dashboard
            </button>
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
                  : "Something went wrong while processing your 3D render. Please try again or contact support if the problem persists."}
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
    </div>
  );
}
