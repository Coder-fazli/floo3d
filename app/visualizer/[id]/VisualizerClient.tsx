"use client";

import "./visualizer.css";
import NextImage from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { getCredits, getUserInfo } from "@/lib/actions";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getProject } from "@/lib/actions";
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from "react-compare-slider";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import SocialButton from "@/components/kokonutui/social-button";
import Image from "next/image";
import Link from "next/link";
import { Download, RefreshCcw, Maximize2, ZoomIn, ZoomOut, ChevronRight, Upload as UploadIcon, Home, Zap, Sparkles, Bell, Lock } from "lucide-react";
import NameProjectModal from "@/components/NameProjectModal";
import { HoleBackground } from "@/components/animate-ui/components/backgrounds/hole";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { SparklesText } from "@/components/ui/sparkles-text";
import { type FramesData } from "@/lib/actions";
import { DEFAULT_FALLBACKS, DEFAULT_STYLES, DEFAULT_ANGLES, ANGLE_LABELS } from "@/lib/frameDefaults";
import FpgSidebarSection, { type FpgConfig } from "../components/FpgSidebarSection";

const STYLES: Record<string, string[]> = {
  "floor-plan":           ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"],
  "interior-design":      ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"],
  "outdoor":              ["Modern", "Japanese", "Tropical", "Cottage", "Mediterranean", "Desert"],
  "empty-room":           ["Clean"],
  "floor-plan-generator": [],
};


const ROOM_TYPES = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Dining Room", "Studio", "Hallway", "Kids Room"];

export default function VisualizerClient({ embeddedId, frames, defaultType }: { embeddedId?: string; frames?: FramesData; defaultType?: string } = {}) {
  const FALLBACK_IMAGES = Object.fromEntries(
    Object.entries(DEFAULT_FALLBACKS).map(([k, v]) => [k, { ...v, ...(frames?.fallbacks?.[k] ?? {}) }])
  );
  const getAngleImage = (angle: string) => frames?.angles?.[angle] ?? DEFAULT_ANGLES[angle] ?? "/real-3d-render.jpg";
  // Resolved per active input type at render time (see usage below)
  const getStyleImage = (inputType: string, style: string) =>
    frames?.styles?.[inputType]?.[style] ?? DEFAULT_STYLES[inputType]?.[style] ?? "/card-room-after.webp";
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = embeddedId ?? (Array.isArray(params.id) ? params.id[0] : params.id);
  const { user } = useUser();
  const { openUserProfile, openSignUp, signOut } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  const [isNewMode, setIsNewMode] = useState(id === "new");

  // Guest mode (embedded pages, no login)
  const GUEST_CREDITS_KEY = "guest_credits";
  const GUEST_CREDITS_DEFAULT = 6;
  const [guestBase64, setGuestBase64] = useState<string | null>(null);
  const [guestResult, setGuestResult] = useState<string | null>(null);
  const [guestCredits, setGuestCredits] = useState(GUEST_CREDITS_DEFAULT);

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
  const [viewAngle, setViewAngle] = useState("topDown");
  const [isCreating, setIsCreating] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const pendingFileBase64Ref = useRef<string | null>(null);
  // Read type from URL for new mode (or use defaultType prop)

   const [inputTypeNew, setInputTypeNew] = useState(() => {
    if (typeof window === "undefined") return defaultType ?? "floor-plan";
    const t = new URLSearchParams(window.location.search).get("type") ?? defaultType ?? "floor-plan";
    return t;
  });

  const zoomIn  = () => setZoomLevel(z => parseFloat(Math.min(z + 0.25, 3).toFixed(2)));
  const zoomOut = () => setZoomLevel(z => parseFloat(Math.max(z - 0.25, 0.5).toFixed(2)));

  // Sync inputTypeNew when URL ?type= changes (client-side navigation)
  useEffect(() => {
    const t = searchParams.get("type");
    if (t) setInputTypeNew(t);
  }, [searchParams]);

  // Sync local renderStyle when project loads
  useEffect(() => {
    if (project?.renderStyle) setRenderStyle(project.renderStyle);
  }, [project?.renderStyle]);

  useEffect(() => {
    if (!isNewMode && id && id !== "new") getProject(id as string).then(setProject);
  }, [id, isNewMode]);

  useEffect(() => {
    if (!user) return;
    getCredits(user.id, user.fullName ?? user.firstName ?? "", user.emailAddresses?.[0]?.emailAddress ?? "").then(setCredits);
    getUserInfo(user.id).then(d => setHasPurchased(d.hasPurchased));
  }, [user]);

  // Poll credits + hasPurchased after successful payment
  useEffect(() => {
    if (!user || !window.location.search.includes("success=1")) return;
    let attempts = 0;
    let lastCredits: number | null = null;
    const interval = setInterval(async () => {
      attempts++;
      const d = await getUserInfo(user.id);
      if (lastCredits === null) lastCredits = d.credits;
      if (d.credits > (lastCredits ?? 0)) {
        setCredits(d.credits);
        setHasPurchased(d.hasPurchased);
        clearInterval(interval);
      }
      if (attempts >= 5) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!embeddedId) return;
    const stored = localStorage.getItem(GUEST_CREDITS_KEY);
    if (stored === null) localStorage.setItem(GUEST_CREDITS_KEY, String(GUEST_CREDITS_DEFAULT));
    else setGuestCredits(Math.max(0, parseInt(stored) || 0));
  }, [embeddedId]);

  const runGeneration = async () => {
    if (isProcessing) return;

    // Guest mode — no login, no project, direct generation
    if (embeddedId && !user) {
      if (!guestBase64) return;
      if (guestCredits <= 0) { openSignUp({ fallbackRedirectUrl: "/dashboard" }); return; }
      setIsProcessing(true);
      try {
        const res = await fetch("/api/guest-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Image: guestBase64, renderStyle, roomType, inputType: "floor-plan" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");
        setGuestResult(data.renderedBase64);
        const next = Math.max(0, guestCredits - 1);
        setGuestCredits(next);
        localStorage.setItem(GUEST_CREDITS_KEY, String(next));
      } catch (e: any) { console.error(e); }
      finally { setIsProcessing(false); }
      return;
    }

    if (!project && activeInputType !== "floor-plan-generator") return;
    if (activeInputType !== "floor-plan-generator" && (!project?._id || !project?.originalImageUrl || !user?.id)) {
      console.error("Missing required data");
      return;
    }

    // Floor plan generator — no image needed, uses config
    if (activeInputType === "floor-plan-generator" && user) {
      setIsProcessing(true);
      try {
        const res = await fetch("/api/generate-floor-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config: fpgConfig,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");
        setCurrentImage(data.renderedImageUrl);
        if (data.projectId) window.history.replaceState(null, "", `/visualizer/${data.projectId}`);
        if (user) getCredits(user.id, user.fullName ?? user.firstName ?? "", user.emailAddresses?.[0]?.emailAddress ?? "").then(setCredits);
      } catch (error: any) {
        setModalType("error");
      } finally {
        setIsProcessing(false);
      }
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
          style: renderStyle,
          roomType,
          viewAngle,
        }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      if (!data?.renderedImageUrl) throw new Error("Invalid response from API");
      setCurrentImage(data.renderedImageUrl);
      if (user) getCredits(
        user.id,
        user.fullName ?? user.firstName ?? "",
        user.emailAddresses?.[0]?.emailAddress ?? ""
      ).then(setCredits);
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
    if (!["image/jpeg", "image/png"].includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    if (!user) {
      if (embeddedId) {
        // Guest mode — store locally, no project creation
        const reader = new FileReader();
        reader.onload = () => { setGuestBase64(reader.result as string); setGuestResult(null); };
        reader.readAsDataURL(file);
      } else {
        openSignUp({ fallbackRedirectUrl: "/dashboard" });
      }
      return;
    }
    if (isCreating) return;
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
    setCurrentImage(null);
    setIsNewMode(false);
    hasInitialGenerated.current = false;
    window.history.replaceState(null, "", `/visualizer/${newProject._id}`);
  };

  const handleNameCancel = () => {
    setNameModalOpen(false);
    pendingFileBase64Ref.current = null;
  };

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "pdf">("png");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);

  // Floor plan generator config
  const [fpgConfig, setFpgConfig] = useState<FpgConfig>({
    propertyType: "House",
    area: 100,
    areaUnit: "m2",
    floors: 1,
    rooms: { bedroom: 2, bathroom: 1, kitchen: 1, livingRoom: 1, diningRoom: 0, office: 0 },
    extras: { garage: false, balcony: false, terrace: false, garden: false },
    style: "blueprint",
  });

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

    if(project?._id) {
      fetch("/api/track-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project._id }),
      });
    }
  };

  const handleFreeDownload = async (fmt: "png" | "jpg" | "pdf" = exportFormat) => {
    const src = currentImage || guestResult;
    if (!src) return;
    setExportDropdownOpen(false);
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = 1024;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Watermark — only for free users
      if (!hasPurchased) {
        const wFontSize = Math.max(12, Math.round(canvas.width * 0.022));
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = wFontSize * 0.04;
        ctx.font = `600 ${wFontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText("MyHomeStyler.com", canvas.width * 0.5, canvas.height * 0.5);
        ctx.fillText("MyHomeStyler.com", canvas.width * 0.5, canvas.height * 0.5);
        ctx.restore();
      }

      if (fmt === "pdf") {
        import("jspdf").then(({ jsPDF }) => {
          const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "px", format: [canvas.width, canvas.height] });
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
          pdf.save(`${project?.name || "render"}.pdf`);
        });
      } else {
        const link = document.createElement("a");
        const isPng = fmt === "png";
        link.download = `${project?.name || "render"}.${fmt}`;
        link.href = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", isPng ? 1 : 0.85);
        link.click();
      }
    };
    img.src = src;
    if (project?._id) {
      fetch("/api/track-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project._id }),
      });
    }
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
      {!embeddedId && <header className="viz-nav">
        <div className="viz-nav-inner">
          <div className="viz-nav-left">
            <Link href="/dashboard" className="viz-brand">
              <div className="viz-brand-icon">
                <Image src="/favicon.png" alt="MyHomeStyler" width={20} height={20} />
              </div>
              <span className="viz-brand-name">MyHome<span className="viz-brand-accent">Styler</span></span>
            </Link>
            <nav className="viz-breadcrumb">
              <Link href="/dashboard" className="viz-breadcrumb-link">Dashboard</Link>
              <ChevronRight size={14} className="viz-breadcrumb-sep" />
              <span className="viz-breadcrumb-current">{isNewMode ? "New Project" : (project?.name || "Project")}</span>
            </nav>
          </div>

          <div className="viz-nav-right">
            <button className="viz-nav-bell">
              <Bell size={17} />
              <span className="viz-nav-bell-dot" />
            </button>

            <div className="viz-nav-credits">
              <Zap size={13} />
              <span>{credits ?? "—"} Credits</span>
            </div>

            <div className="viz-nav-divider" />

            <button className="viz-nav-signout" onClick={() => signOut({ redirectUrl: "/" })}>Log Out</button>

            <button className="viz-nav-user" onClick={() => openUserProfile()}>
              <div className="viz-nav-user-info">
                <p className="viz-nav-user-name">{user?.username ?? user?.firstName ?? "User"}</p>
                <p className="viz-nav-user-plan">Pro Plan</p>
              </div>
              <div className="viz-nav-avatar">
                {user?.imageUrl ? (
                  <NextImage src={user.imageUrl} alt="avatar" width={32} height={32} />
                ) : (
                  <span className="viz-nav-avatar-fallback">{user?.firstName?.[0] ?? "U"}</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>}

      <main className="viz-main">

        {/* Low credits banner — full visualizer */}
        {!embeddedId && credits !== null && credits < 2 && (
          <div className="viz-credits-banner">
            <span className="viz-credits-banner-icon">⚡</span>
            <span className="viz-credits-banner-text">
              {credits === 0
                ? "You're out of credits — upgrade to keep generating."
                : `Only ${credits} credit${credits === 1 ? "" : "s"} left — upgrade to avoid interruption.`}
            </span>
            <button className="viz-credits-banner-btn" onClick={() => window.open("/pricing", "_blank")}>Upgrade Now</button>
          </div>
        )}

        {/* Embedded info bar */}
        {embeddedId && (
          <div className="viz-embed-bar">
            <span className="viz-embed-bar-icon">⚡</span>
            {user ? (
              <span className="viz-embed-bar-text">
                You have <strong>{credits ?? "—"} credits</strong> remaining.
              </span>
            ) : (
              <span className="viz-embed-bar-text">
                <strong>{guestCredits} free generation{guestCredits !== 1 ? "s" : ""}</strong> remaining — no sign up needed.{" "}
                <button className="viz-embed-bar-link" onClick={() => openSignUp({ fallbackRedirectUrl: "/dashboard" })}>
                  Sign up free → get 10 more
                </button>
                {" "}· no credit card needed
              </span>
            )}
          </div>
        )}

        {/* Project header */}
        {!embeddedId && <div className="viz-project-head">
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
                <SocialButton shareUrl={shareUrl} />
              </div>
            </div>
            <RainbowButton variant="outline" className="viz-homegen-btn">
              <Sparkles size={14} />
              HomeGen™ Engine
            </RainbowButton>
          </div>
        </div>}

        {/* Workspace: sidebar + output */}
        <div className="viz-workspace">

          {/* Sidebar */}
          <aside className="viz-sidebar">

            {activeInputType === "floor-plan-generator" ? (
              <FpgSidebarSection config={fpgConfig} onChange={setFpgConfig} getStyleImage={(s) => getStyleImage("floor-plan-generator", s)} />
            ) : (
            <div className="viz-sb-section">
              <div className="viz-sb-section-title">
                <UploadIcon size={13} strokeWidth={2.5} style={{ color: "#ec5b13" }} />
                Upload Your Image
              </div>
              <div
                className={`viz-sb-upload${isDraggingOver ? " viz-sb-upload-active" : ""}`}
                onClick={() => (user || embeddedId) ? sidebarFileRef.current?.click() : openSignUp({ fallbackRedirectUrl: "/dashboard" })}
                onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setIsDraggingOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDraggingOver(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); dragCounterRef.current = 0; setIsDraggingOver(false); const f = e.dataTransfer.files[0]; if (f) handleSidebarFile(f); }}
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
            )}

            {/* Room Type — only for interior-design and empty-room */}
            {!embeddedId && activeInputType !== "floor-plan" && activeInputType !== "outdoor" && activeInputType !== "floor-plan-generator" && <div className="viz-sb-section">
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
            </div>}

            {/* View Angle — only for floor-plan */}
            {activeInputType === "floor-plan" && activeInputType !== "floor-plan-generator" && (
              <div className="viz-sb-section">
                <div className="viz-sb-section-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ec5b13" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  View Angle
                </div>
                <div className="viz-style-scroll">
                  <div className="viz-style-grid">
                    {Object.keys(DEFAULT_ANGLES).map((angle) => {
                      const isProAngle = angle === "isometric" || angle === "crossSection";
                      const locked = isProAngle && !hasPurchased;
                      return (
                        <div
                          key={angle}
                          className={`viz-style-card${viewAngle === angle && !locked ? " viz-style-card-active" : ""}${locked ? " viz-style-card-locked" : ""}`}
                          onClick={() => {
                            if (locked) { window.open("/pricing", "_blank"); return; }
                            setViewAngle(angle);
                          }}
                          title={locked ? "Pro feature — Upgrade to unlock" : undefined}
                        >
                          <div className="viz-style-card-img">
                            <img src={getAngleImage(angle)} alt={ANGLE_LABELS[angle]} style={locked ? { filter: "brightness(0.45)" } : undefined} />
                            {locked ? (
                              <div className="viz-style-card-lock">
                                <Lock size={14} color="#fff" />
                                <span>Pro</span>
                              </div>
                            ) : viewAngle === angle && (
                              <div className="viz-style-card-check">
                                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>
                              </div>
                            )}
                          </div>
                          <div className="viz-style-card-label" style={locked ? { color: "#64748b" } : undefined}>{ANGLE_LABELS[angle]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Design Style — hidden for floor-plan-generator (handled inside FpgSidebarSection) */}
            {activeInputType !== "floor-plan-generator" && <div className="viz-sb-section viz-sb-section-grow">
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
                        <img src={getStyleImage(activeInputType, s)} alt={s} />
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
            </div>}

            {/* Generate */}
            <div className="viz-generate-wrap">
              <button
                className="viz-generate-btn"
                onClick={runGeneration}
                disabled={isProcessing || (embeddedId && !user ? !guestBase64 : (activeInputType !== "floor-plan-generator" && (isNewMode || !project)))}
              >
                {isProcessing ? (
                  <>
                    <Zap size={15} strokeWidth={2.5} />
                    Generating…
                  </>
                ) : (
                  <SparklesText
                    className="text-sm font-bold leading-none"
                    sparklesCount={6}
                    colors={{ first: "#fff176", second: "#ffd54f" }}
                  >
                    {(embeddedId && !user) ? (guestResult ? "✦ Regenerate" : "✦ Generate") : (currentImage ? "✦ Regenerate" : "✦ Generate")}
                  </SparklesText>
                )}
              </button>
              <div className="viz-credit-note">
                ⚡ Uses <span>2 credits</span> per generation
              </div>
            </div>

          </aside>

          {/* Output card */}
          <div className="viz-output-card">
            <div className="viz-output-head">
              <span className="viz-output-title">Preview</span>
              <div className="viz-output-actions">
                <div className="viz-export-wrapper">
                  <button className="viz-download-btn" onClick={() => setExportDropdownOpen(o => !o)} disabled={!currentImage && !guestResult}>
                    <Download size={12} strokeWidth={2.5} />
                    <SparklesText
                      className="viz-download-sparkles-text"
                      sparklesCount={4}
                      colors={{ first: "#ffffff", second: "#e2e8f0" }}
                    >
                      Export
                    </SparklesText>
                    <div className="viz-download-shimmer" />
                  </button>
                  {exportDropdownOpen && (
                    <div className="viz-export-dropdown">
                      <p className="viz-export-title">Export options</p>
                      <div className="viz-export-formats">
                        {(["png", "jpg", "pdf"] as const).map(fmt => (
                          <label
                            key={fmt}
                            className={`viz-export-fmt${exportFormat === fmt ? " viz-export-fmt-active" : ""}${fmt === "pdf" && !hasPurchased ? " viz-export-fmt-locked" : ""}`}
                            onClick={() => {
                              if (fmt === "pdf" && !hasPurchased) {
                                window.open("/pricing", "_blank");
                              } else {
                                setExportFormat(fmt);
                              }
                            }}
                          >
                            <input
                              type="radio"
                              name="exportFormat"
                              value={fmt}
                              checked={exportFormat === fmt}
                              readOnly
                              disabled={fmt === "pdf" && !hasPurchased}
                              style={{ accentColor: "#ec5b13" }}
                            />
                            <span className="viz-export-fmt-label">{fmt.toUpperCase()}</span>
                            {fmt === "pdf" && !hasPurchased && <span className="viz-export-pro-badge">👑 Pro</span>}
                          </label>
                        ))}
                      </div>
                      <p className="viz-export-desc">
                        {exportFormat === "png" ? "Standard quality · Upgrade for HD" : "Smaller file size, great for sharing."}
                      </p>
                      <button className="viz-export-dl-btn" onClick={() => handleFreeDownload()}>
                        <Download size={14} strokeWidth={2.5} />
                        Download
                      </button>
                      {hasPurchased ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', padding: '0.5rem 0.75rem', background: 'rgba(22,163,74,0.07)', borderRadius: '0.5rem', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem' }}>🔓</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>HD quality · Commercial use unlocked</span>
                        </div>
                      ) : (
                        <>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0 0 0.25rem', textAlign: 'center' }}>
                            Standard quality · <a href="/pricing" target="_blank" rel="noopener noreferrer" style={{ color: '#ec5b13', fontWeight: 700, textDecoration: 'none' }}>Upgrade for HD</a>
                          </p>
                          <p className="viz-export-commercial">
                            Free downloads are for personal use only.{" "}
                            <a href="/pricing" target="_blank" rel="noopener noreferrer" className="viz-export-get-plan">
                              Get a plan
                            </a>{" "}
                            for commercial use.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
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
            <div className="viz-compare-wrap">
              {/* Guest mode result */}
              {embeddedId && !user && guestResult && guestBase64 ? (
                <ReactCompareSlider
                  defaultValue={50}
                  style={{ width: "100%", height: "100%", transform: `scale(${zoomLevel})`, transformOrigin: "center", transition: "transform 0.3s ease" }}
                  handle={<ReactCompareSliderHandle buttonStyle={{ background: "#fff", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,0.25)", color: "#ec5b13" }} linesStyle={{ background: "#ec5b13", width: 3, opacity: 0.9 }} />}
                  itemOne={<ReactCompareSliderImage src={guestBase64} alt="Original" style={{ objectFit: "contain", background: "#f1f5f9" }} />}
                  itemTwo={<ReactCompareSliderImage src={guestResult} alt="Result" style={{ objectFit: "contain", background: "#f1f5f9", cursor: "zoom-in" }} onClick={() => setLightboxOpen(true)} onContextMenu={e => e.preventDefault()} />}
                />
              ) : embeddedId && !user && guestBase64 ? (
                <img src={guestBase64} alt="Uploaded" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f1f5f9" }} onContextMenu={e => e.preventDefault()} />
              ) : activeInputType === "floor-plan-generator" && currentImage ? (
                <img
                  src={currentImage}
                  alt="Generated Floor Plan"
                  style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f1f5f9", cursor: "zoom-in", transform: `scale(${zoomLevel})`, transformOrigin: "center", transition: "transform 0.3s ease" }}
                  onClick={() => setLightboxOpen(true)}
                  onContextMenu={e => e.preventDefault()}
                />
              ) : project?.originalImageUrl && currentImage ? (
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
                      style={{ objectFit: "contain", background: "#f1f5f9" }}
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={currentImage}
                      alt="Result"
                      style={{ objectFit: "contain", background: "#f1f5f9", cursor: "zoom-in" }}
                      onClick={() => setLightboxOpen(true)}
                      onContextMenu={e => e.preventDefault()}
                    />
                  }
                />
              ) : project?.originalImageUrl ? (
                <NextImage src={project.originalImageUrl} alt="Original" fill style={{ objectFit: "contain", background: "#f1f5f9" }} />
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
                  <HoleBackground className="absolute inset-0" />
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
                  <button className="viz-modal-btn-primary" onClick={() => window.open("/pricing", "_blank")}>
                    Upgrade Now
                  </button>
                  <button className="viz-modal-btn-secondary" onClick={() => { setModalType(null); router.push("/dashboard"); }}>
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
          toolbar={{ buttons: ["close"] }}
          render={{
            slide: ({ slide }) => (
              <img
                src={slide.src}
                alt=""
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                onContextMenu={e => e.preventDefault()}
                draggable={false}
              />
            ),
          }}
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
