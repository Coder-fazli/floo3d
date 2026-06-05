"use client";

import "./visualizer.css";
import NextImage from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { getCredits, getUserInfo, saveUserCountry } from "@/lib/actions";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getProject, getProjects } from "@/lib/actions";
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from "react-compare-slider";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from "next/image";
import Link from "next/link";
import { Upload as UploadIcon, Sparkles, X, ExternalLink, Home, Zap } from "lucide-react";
import ProjectModal from "@/components/ProjectModal";
import AppSidebar from "@/components/AppSidebar";
import { SparklesText } from "@/components/ui/sparkles-text";
import ExpandButton from "@/components/ui/ExpandButton";
import CompareButton from "@/components/ui/CompareButton";
import ShareButton from "@/components/ui/ShareButton";
import ExportButton from "@/components/ui/ExportButton";
import { type FramesData } from "@/lib/actions";
import { DEFAULT_FALLBACKS, DEFAULT_STYLES, DEFAULT_ANGLES, ANGLE_LABELS, DEFAULT_ROOM_TYPES } from "@/lib/frameDefaults";
import { type FpgConfig } from "../components/FpgSidebarSection";
import AITextLoading, { LOADING_TEXTS } from "@/components/kokonutui/ai-text-loading";
import RateRender from "@/components/RateRender";

const STYLES: Record<string, string[]> = {
  "floor-plan":           ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"],
  "interior-design":      ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"],
  "outdoor":              ["Modern", "Japanese", "Tropical", "Cottage", "Mediterranean", "Desert"],
  "empty-room":           ["Clean"],
  "floor-plan-generator": [],
};


const ROOM_TYPES = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Dining Room", "Studio", "Hallway", "Kids Room"];

const ROOM_TYPE_DATA = [
  { name: "Living Room",  img: "/room-living.jpg" },
  { name: "Bedroom",      img: "/room-bedroom.jpg" },
  { name: "Kitchen",      img: "/room-kitchen.jpg" },
  { name: "Bathroom",     img: "/room-bathroom.jpg" },
  { name: "Office",       img: "/room-office.jpg" },
  { name: "Dining Room",  img: "/room-dining.jpg" },
  { name: "Studio",       img: "/room-studio.jpg" },
  { name: "Hallway",      img: "/room-hallway.jpg" },
  { name: "Kids Room",    img: "/room-kids.jpg" },
];

const STYLE_TABS: Record<string, Record<string, string[]>> = {
  "interior-design": {
    "All":     ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"],
    "Popular": ["Modern", "Scandinavian", "Minimalist"],
    "Modern":  ["Modern", "Industrial", "Minimalist"],
    "Classic": ["Rustic", "Luxury"],
    "Nature":  ["Scandinavian", "Rustic"],
  },
  "floor-plan": {
    "All":     ["Modern", "Scandinavian", "Industrial", "Rustic", "Luxury", "Minimalist"],
    "Popular": ["Modern", "Scandinavian", "Minimalist"],
    "Modern":  ["Modern", "Industrial", "Minimalist"],
    "Classic": ["Rustic", "Luxury"],
    "Nature":  ["Scandinavian", "Rustic"],
  },
  "outdoor": {
    "All":        ["Modern", "Japanese", "Tropical", "Cottage", "Mediterranean", "Desert"],
    "Popular":    ["Modern", "Japanese", "Tropical"],
    "Natural":    ["Japanese", "Tropical", "Cottage"],
    "Warm":       ["Mediterranean", "Desert", "Cottage"],
  },
};


export default function VisualizerClient({ embeddedId, frames, defaultType, isAdminView }: { embeddedId?: string; frames?: FramesData; defaultType?: string; isAdminView?: boolean } = {}) {
  const FALLBACK_IMAGES = Object.fromEntries(
    Object.entries(DEFAULT_FALLBACKS).map(([k, v]) => [k, { ...v, ...(frames?.fallbacks?.[k] ?? {}) }])
  );
  const getAngleImage = (angle: string) => frames?.angles?.[angle] ?? DEFAULT_ANGLES[angle] ?? "/real-3d-render.jpg";
  // Resolved per active input type at render time (see usage below)
  const getStyleImage = (inputType: string, style: string) =>
    frames?.styles?.[inputType]?.[style] ?? DEFAULT_STYLES[inputType]?.[style] ?? "/card-room-after.webp";
  const getRoomTypeImage = (name: string) =>
    frames?.roomTypes?.[name] ?? DEFAULT_ROOM_TYPES[name] ?? "/card-room-after.webp";
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = embeddedId ?? (Array.isArray(params.id) ? params.id[0] : params.id);
  const { user } = useUser();
  const { openUserProfile, openSignUp, signOut } = useClerk();
  const [credits, setCredits] = useState<number | null>(null);
  const [hasPurchased, setHasPurchased] = useState(isAdminView ? true : false);

  const [isNewMode, setIsNewMode] = useState(id === "new");

  // Guest mode disabled — sign-up required
  // const GUEST_CREDITS_KEY = "guest_credits";
  // const GUEST_CREDITS_DEFAULT = 2;
  // const [guestBase64, setGuestBase64] = useState<string | null>(null);
  // const [guestResult, setGuestResult] = useState<string | null>(null);
  // const [guestCredits, setGuestCredits] = useState(GUEST_CREDITS_DEFAULT);

  const previewCardRef = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [modalType, setModalType] = useState<"error" | "credits" | "suspended" | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sidebar state
  const [renderStyle, setRenderStyle] = useState("Modern");
  const [roomType, setRoomType] = useState("Living Room");
  const [viewAngle, setViewAngle] = useState("topDown");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // Read type from URL for new mode (or use defaultType prop)

   const [inputTypeNew, setInputTypeNew] = useState(() => {
    if (typeof window === "undefined") return defaultType ?? "floor-plan";
    const t = new URLSearchParams(window.location.search).get("type") ?? defaultType ?? "floor-plan";
    return t;
  });

  const zoomIn  = () => setZoomLevel(z => parseFloat(Math.min(z + 0.25, 3).toFixed(2)));
  const zoomOut = () => setZoomLevel(z => parseFloat(Math.max(z - 0.25, 0.5).toFixed(2)));

  // Welcome popup
  const WELCOME_POPUP_META: Record<string, { title: string; body: string; img?: string | null } | null> = {
    "floor-plan":      { title: "You need a floor plan drawing", body: "Upload a top-down architectural drawing — like the example above. Hand-drawn sketches, digital plans, or scanned blueprints all work great.\n\nPhotos of interiors or separate furniture will NOT work here.", img: "/example-blueprint.jpg" },
    "interior-design": { title: "Upload an interior photo", body: "Upload any photo of an interior space — kitchen, living room, bedroom, bathroom, anything inside.\n\nDo NOT upload floor plan drawings or blueprints here. This tool is for interior photos only.", img: "/example-interior.jpg" },
    "outdoor":         { title: "You need a photo of your outdoor space", body: "Upload a photo of your garden, yard, or exterior. The AI will transform it with a new landscape design.\n\nMake sure the outdoor area is clearly visible.", img: null },
    "empty-room":      { title: "You need a photo of an empty room", body: "Upload a photo of a room with no furniture. The AI will virtually stage it with beautiful furniture and decor.\n\nRooms with existing furniture may give unexpected results.", img: null },
    "floor-plan-generator": null,
  };
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  useEffect(() => {
    if (!isNewMode || isAdminView) return;
    const key = `welcome_shown_${inputTypeNew}`;
    if (!sessionStorage.getItem(key) && WELCOME_POPUP_META[inputTypeNew]) {
      setWelcomeOpen(true);
      sessionStorage.setItem(key, "1");
    }
  }, [isNewMode, inputTypeNew]);

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
    if (!isAdminView) getUserInfo(user.id).then(d => setHasPurchased(d.hasPurchased));
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => { if (d?.country_code) saveUserCountry(user.id, d.country_code); })
      .catch(() => {});
    // Load all user projects that have a rendered image
    getProjects(user.id).then(projects =>
      setUserProjects(projects.filter((p: any) => p.renderedImageUrl))
    );
  }, [user?.id]);

  // Poll credits + hasPurchased after successful payment
  useEffect(() => {
    if (!user || isAdminView || !window.location.search.includes("success=1")) return;
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

  // Guest mode localStorage init disabled
  // useEffect(() => {
  //   if (!embeddedId) return;
  //   const stored = localStorage.getItem(GUEST_CREDITS_KEY);
  //   if (stored === null) {
  //     localStorage.setItem(GUEST_CREDITS_KEY, String(GUEST_CREDITS_DEFAULT));
  //   } else {
  //     const parsed = Math.max(0, parseInt(stored) || 0);
  //     const clamped = Math.min(parsed, GUEST_CREDITS_DEFAULT);
  //     if (clamped !== parsed) localStorage.setItem(GUEST_CREDITS_KEY, String(clamped));
  //     setGuestCredits(clamped);
  //   }
  // }, [embeddedId]);

  const runGeneration = async () => {
    if (isProcessing) return;
    setMobileTab("history");

    // Guest mode disabled — redirect to sign up
    if (embeddedId && !user) {
      openSignUp({ fallbackRedirectUrl: "/dashboard" });
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
            customPrompt: customPrompt.trim().slice(0, 1000),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");
        setCurrentImage(data.renderedImageUrl);
        setMobileTab("history");
        if (data.projectId) {
          window.history.replaceState(null, "", `/visualizer/${data.projectId}`);
          setUserProjects(prev => {
            const exists = prev.find(p => p._id === data.projectId);
            if (exists) return prev.map(p => p._id === data.projectId ? { ...p, renderedImageUrl: data.renderedImageUrl } : p);
            return [{ _id: data.projectId, renderedImageUrl: data.renderedImageUrl, name: "Floor Plan", renderStyle: fpgConfig.style, createdAt: new Date() }, ...prev];
          });
        }
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
          customPrompt: customPrompt.trim().slice(0, 1000),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "suspended") { setModalType("suspended"); return; }
        if (res.status === 403) { setModalType("credits"); return; }
        throw new Error(data.error || "Generation failed");
      }
      if (!data?.renderedImageUrl) throw new Error("Invalid response from API");
      setCurrentImage(data.renderedImageUrl);
      setMobileTab("history");
      // Update this project's thumbnail in the user projects gallery
      setUserProjects(prev => {
        const exists = prev.find(p => p._id === project._id);
        if (exists) return prev.map(p => p._id === project._id ? { ...p, renderedImageUrl: data.renderedImageUrl } : p);
        return [{ ...project, renderedImageUrl: data.renderedImageUrl }, ...prev];
      });
      if (user) getCredits(
        user.id,
        user.fullName ?? user.firstName ?? "",
        user.emailAddresses?.[0]?.emailAddress ?? ""
      ).then(setCredits);
    } catch (error: any) {
      setModalType("error");
      console.error("Generation failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Set the comparison slider image when the project loads
  useEffect(() => {
    if (!project) return;
    if (project.renderedImageUrl) setCurrentImage(project.renderedImageUrl);
    else setCurrentImage(null);
  }, [project?._id]);


  // Handle upload in sidebar
  const sidebarFileRef = useRef<HTMLInputElement>(null);

  const handleSidebarFile = (file: File) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    if (!user) {
      openSignUp({ fallbackRedirectUrl: "/dashboard" });
      return;
    }
    if (isCreating) return;
    const MAX_BYTES = 10 * 1024 * 1024;
    if (!["image/jpeg", "image/png"].includes(file.type)) return;
    if (file.size > MAX_BYTES) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      if (!user) return;
      setIsCreating(true);
      const inputType = isNewMode ? inputTypeNew : (project?.inputType ?? "floor-plan");
      // Auto-generate name from style + input type
      const typeLabel: Record<string, string> = {
        "interior-design": "Interior",
        "floor-plan": "Floor Plan",
        "outdoor": "Outdoor",
        "empty-room": "Empty Room",
      };
      const autoName = `${renderStyle} ${typeLabel[inputType] ?? "Design"}`;
      const res = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: autoName, userId: user.id, base64Image: base64, inputType, renderStyle }),
      });
      const newProject = await res.json();
      setIsCreating(false);
      setProject(newProject);
      setCurrentImage(null);
      setIsNewMode(false);
      window.history.replaceState(null, "", `/visualizer/${newProject._id}`);
    };
    reader.readAsDataURL(file);
  };

  const [mobileTab, setMobileTab] = useState<"generator" | "history">("generator");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [roomTypeModalOpen, setRoomTypeModalOpen] = useState(false);
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [angleModalOpen, setAngleModalOpen] = useState(false);
  const [fpgConfigModalOpen, setFpgConfigModalOpen] = useState(false);
  const [fpgStyleModalOpen, setFpgStyleModalOpen] = useState(false);
  const [styleTab, setStyleTab] = useState("All");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<"upload" | "examples">("upload");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  // Track if user explicitly chose a value (shows thumbnail in card)
  const [roomTypeChosen, setRoomTypeChosen] = useState(false);
  const [styleChosen, setStyleChosen] = useState(false);
  const dragCounterRef = useRef(0);

  // All user projects with renders — shown as gallery below preview card
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [historyModal, setHistoryModal] = useState<any | null>(null);
  const [historyModalWithCompare, setHistoryModalWithCompare] = useState(false);

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
  const [fpgAreaStr, setFpgAreaStr] = useState(String(fpgConfig.area));

  const handleMobileHistoryTap = (p: any) => {
    if (window.innerWidth > 768) { setHistoryModal(p); return; }
    setProject(p);
    setCurrentImage(p.renderedImageUrl);
    setMobileTab("history");
    previewCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/visualizer/${id}`;
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  };


  const downloadHistoryImage = async (url: string, styleName: string, projectId?: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${styleName.toLowerCase().replace(/\s+/g, "-")}-render.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
    const pid = projectId ?? project?._id;
    if (pid) {
      fetch("/api/track-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: pid }),
      });
    }
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/visualizer/${id}` : "";

  const EXAMPLE_IMAGES: Record<string, Array<{ url: string; label: string }>> = {
    "interior-design": [
      { url: "/room-living.jpg",   label: "Living Room" },
      { url: "/room-bedroom.jpg",  label: "Bedroom" },
      { url: "/room-kitchen.jpg",  label: "Kitchen" },
      { url: "/room-office.jpg",   label: "Office" },
      { url: "/room-dining.jpg",   label: "Dining Room" },
      { url: "/room-bathroom.jpg", label: "Bathroom" },
    ],
    "floor-plan": [
      { url: "/example-blueprint.jpg", label: "Blueprint" },
    ],
    "outdoor": [
      { url: "/room-living.jpg",  label: "Outdoor 1" },
      { url: "/room-studio.jpg",  label: "Outdoor 2" },
    ],
    "empty-room": [
      { url: "/room-living.jpg",   label: "Living Room" },
      { url: "/room-bedroom.jpg",  label: "Bedroom" },
      { url: "/room-studio.jpg",   label: "Studio" },
    ],
  };

  const handleAssetConfirm = async () => {
    if (!selectedAsset) return;
    setUploadModalOpen(false);
    try {
      const res = await fetch(selectedAsset);
      const blob = await res.blob();
      const file = new File([blob], "example.jpg", { type: blob.type || "image/jpeg" });
      handleSidebarFile(file);
    } catch (e) {
      console.error("Failed to use example image", e);
    } finally {
      setSelectedAsset(null);
    }
  };

  const openUploadModal = () => {
    if (!user && !embeddedId) { openSignUp({ fallbackRedirectUrl: "/dashboard" }); return; }
    if (!isAdminView && credits !== null && credits < 2) 
    { setModalType("credits"); return; }
    setUploadTab("upload");
    setSelectedAsset(null);
    setUploadModalOpen(true);
  };

  const activeInputType = isNewMode ? inputTypeNew : (project?.inputType ?? "floor-plan");
  const styleList = STYLES[activeInputType] ?? STYLES["floor-plan"];

  return (
    <div className="viz-page">

      {/* Welcome popup */}
      {welcomeOpen && (() => {
        const meta = WELCOME_POPUP_META[inputTypeNew];
        if (!meta) return null;
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setWelcomeOpen(false)}>
            <div style={{ background: "#fff", borderRadius: "1.25rem", maxWidth: "480px", width: "100%", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
              {meta.img && (
                <div style={{ background: "#f8fafc", padding: "1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                  <img src={meta.img} alt="Example" style={{ width: "100%", borderRadius: "0.75rem", display: "block", maxHeight: "240px", objectFit: "contain" }} />
                </div>
              )}
              <div style={{ padding: "1.5rem" }}>
                <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{meta.title}</h2>
                {meta.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: "0 0 0.6rem", fontSize: "0.875rem", color: i === 0 ? "#334155" : "#94a3b8", lineHeight: 1.6 }}>{para}</p>
                ))}
                <button
                  onClick={() => setWelcomeOpen(false)}
                  style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", background: "var(--brand-color)", color: "#fff", border: "none", borderRadius: "0.75rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Got it, let&apos;s go →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── FPG Configure Modal ── */}
      {fpgConfigModalOpen && (
        <div className="viz-modal-backdrop" onClick={() => setFpgConfigModalOpen(false)}>
          <div className="viz-modal-box viz-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="viz-modal-header">
              <h2 className="viz-modal-title">Configure Floor Plan</h2>
              <button className="viz-modal-close" onClick={() => setFpgConfigModalOpen(false)}>✕</button>
            </div>
            <div className="viz-modal-scroll" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem 1.25rem" }}>

              {/* Property Type */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Property Type</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["House", "Apartment", "Villa", "Studio", "Office"].map(t => (
                    <button key={t} onClick={() => setFpgConfig(c => ({ ...c, propertyType: t }))}
                      style={{ padding: "0.4rem 1rem", borderRadius: "9999px", border: "1.5px solid", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                        borderColor: fpgConfig.propertyType === t ? "var(--brand-color)" : "#e8e4df",
                        background: fpgConfig.propertyType === t ? "rgba(236,91,19,0.08)" : "#f8fafc",
                        color: fpgConfig.propertyType === t ? "var(--brand-color)" : "#64748b" }}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Total Area */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Total Area</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="number" className="viz-room-select" style={{ flex: 1 }} value={fpgAreaStr} min={20} max={2000}
                    onChange={e => { const raw = e.target.value.replace(/^0+(?=\d)/, ""); setFpgAreaStr(raw); const n = parseInt(raw, 10); if (!isNaN(n)) setFpgConfig(c => ({ ...c, area: n })); }}
                    onBlur={e => { const n = Math.max(20, Math.min(2000, parseInt(e.target.value, 10) || 20)); setFpgAreaStr(String(n)); setFpgConfig(c => ({ ...c, area: n })); }}
                  />
                  <select className="viz-room-select" style={{ width: "80px" }} value={fpgConfig.areaUnit} onChange={e => setFpgConfig(c => ({ ...c, areaUnit: e.target.value as "m2" | "sqft" }))}>
                    <option value="m2">m²</option>
                    <option value="sqft">sqft</option>
                  </select>
                </div>
              </div>

              {/* Floors */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Floors</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button className="viz-icon-btn" onClick={() => setFpgConfig(c => ({ ...c, floors: Math.max(1, c.floors - 1) }))}>-</button>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, minWidth: "1.5rem", textAlign: "center" }}>{fpgConfig.floors}</span>
                  <button className="viz-icon-btn" onClick={() => setFpgConfig(c => ({ ...c, floors: Math.min(5, c.floors + 1) }))}>+</button>
                </div>
              </div>

              {/* Rooms */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Rooms</span>
                {([["bedroom","Bedroom"],["bathroom","Bathroom"],["kitchen","Kitchen"],["livingRoom","Living Room"],["diningRoom","Dining Room"],["office","Office"]] as const).map(([key, label]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.25rem 0" }}>
                    <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 500 }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <button className="viz-icon-btn" onClick={() => setFpgConfig(c => ({ ...c, rooms: { ...c.rooms, [key]: Math.max(0, c.rooms[key] - 1) } }))}>-</button>
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, minWidth: "1.5rem", textAlign: "center" }}>{fpgConfig.rooms[key]}</span>
                      <button className="viz-icon-btn" onClick={() => setFpgConfig(c => ({ ...c, rooms: { ...c.rooms, [key]: c.rooms[key] + 1 } }))}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extras */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Extras</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {(["garage","balcony","terrace","garden"] as const).map(key => (
                    <button key={key} onClick={() => setFpgConfig(c => ({ ...c, extras: { ...c.extras, [key]: !c.extras[key] } }))}
                      style={{ padding: "0.4rem 1rem", borderRadius: "9999px", border: "1.5px solid", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                        borderColor: fpgConfig.extras[key] ? "var(--brand-color)" : "#e8e4df",
                        background: fpgConfig.extras[key] ? "rgba(236,91,19,0.08)" : "#f8fafc",
                        color: fpgConfig.extras[key] ? "var(--brand-color)" : "#64748b" }}
                    >{key}</button>
                  ))}
                </div>
              </div>

            </div>
            <div className="viz-modal-footer viz-modal-footer-sticky">
              <button className="viz-modal-cancel" onClick={() => setFpgConfigModalOpen(false)}>Cancel</button>
              <button className="viz-modal-confirm" onClick={() => setFpgConfigModalOpen(false)}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FPG Style Modal ── */}
      {fpgStyleModalOpen && (
        <div className="viz-modal-backdrop" onClick={() => setFpgStyleModalOpen(false)}>
          <div className="viz-modal-box viz-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="viz-modal-header">
              <h2 className="viz-modal-title">Choose Style</h2>
              <button className="viz-modal-close" onClick={() => setFpgStyleModalOpen(false)}>✕</button>
            </div>
            <div className="viz-modal-grid viz-modal-scroll">
              {([["blueprint","Blueprint"],["colored","Colored"],["isometric","Isometric"],["3d top-down","3D Top-Down"]] as const).map(([key, label]) => (
                <div key={key} className={`viz-modal-item${fpgConfig.style === key ? " viz-modal-item-active" : ""}`}
                  onClick={() => setFpgConfig(c => ({ ...c, style: key }))}>
                  <div className="viz-modal-item-img">
                    <img src={getStyleImage("floor-plan-generator", label)} alt={label} onError={e => { (e.target as HTMLImageElement).src = "/real-3d-render.jpg"; }} />
                    {fpgConfig.style === key && <div className="viz-modal-item-check">✓</div>}
                  </div>
                  <span className="viz-modal-item-label">{label}</span>
                </div>
              ))}
            </div>
            <div className="viz-modal-footer viz-modal-footer-sticky">
              <button className="viz-modal-cancel" onClick={() => setFpgStyleModalOpen(false)}>Cancel</button>
              <button className="viz-modal-confirm" onClick={() => setFpgStyleModalOpen(false)}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Angle Modal ── */}
      {angleModalOpen && (
        <div className="viz-modal-backdrop" onClick={() => setAngleModalOpen(false)}>
          <div className="viz-modal-box viz-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="viz-modal-header">
              <h2 className="viz-modal-title">Choose Angle</h2>
              <button className="viz-modal-close" onClick={() => setAngleModalOpen(false)}>✕</button>
            </div>
            <div className="viz-modal-grid viz-modal-scroll">
              {Object.entries(ANGLE_LABELS).map(([key, label]) => {
                const isLocked = (key === "isometric" || key === "crossSection") && !hasPurchased && !isAdminView;
                return (
                  <div
                    key={key}
                    className={`viz-modal-item${viewAngle === key ? " viz-modal-item-active" : ""}${isLocked ? " viz-modal-item-locked" : ""}`}
                    onClick={() => isLocked ? window.open("/pricing", "_blank") : setViewAngle(key)}
                    style={{ position: "relative", opacity: isLocked ? 0.7 : 1 }}
                  >
                    <div className="viz-modal-item-img">
                      <img src={getAngleImage(key)} alt={label} onError={(e) => { (e.target as HTMLImageElement).src = "/real-3d-render.jpg"; }} />
                      {viewAngle === key && <div className="viz-modal-item-check">✓</div>}
                      {isLocked && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.5rem" }}>
                          <span style={{ fontSize: "1.25rem" }}>👑</span>
                        </div>
                      )}
                    </div>
                    <span className="viz-modal-item-label">{label}{isLocked ? " · Pro" : ""}</span>
                  </div>
                );
              })}
            </div>
            <div className="viz-modal-footer viz-modal-footer-sticky">
              <button className="viz-modal-cancel" onClick={() => setAngleModalOpen(false)}>Cancel</button>
              <button className="viz-modal-confirm" onClick={() => setAngleModalOpen(false)}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Room Type Modal ── */}
      {roomTypeModalOpen && (
        <div className="viz-modal-backdrop" onClick={() => setRoomTypeModalOpen(false)}>
          <div className="viz-modal-box viz-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="viz-modal-header">
              <h2 className="viz-modal-title">Choose Room Type</h2>
              <button className="viz-modal-close" onClick={() => setRoomTypeModalOpen(false)}>✕</button>
            </div>
            <div className="viz-modal-grid viz-modal-scroll">
              {ROOM_TYPE_DATA.map(({ name }) => (
                <div
                  key={name}
                  className={`viz-modal-item${roomType === name ? " viz-modal-item-active" : ""}`}
                  onClick={() => { setRoomType(name); setRoomTypeChosen(true); }}
                >
                  <div className="viz-modal-item-img">
                    <img src={getRoomTypeImage(name)} alt={name} onError={(e) => { (e.target as HTMLImageElement).src = "/card-room-after.webp"; }} />
                    {roomType === name && <div className="viz-modal-item-check">✓</div>}
                  </div>
                  <span className="viz-modal-item-label">{name}</span>
                </div>
              ))}
            </div>
            <div className="viz-modal-footer viz-modal-footer-sticky">
              <button className="viz-modal-cancel" onClick={() => setRoomTypeModalOpen(false)}>Cancel</button>
              <button className="viz-modal-confirm" onClick={() => setRoomTypeModalOpen(false)}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Style Modal ── */}
      {styleModalOpen && (
        <div className="viz-modal-backdrop" onClick={() => setStyleModalOpen(false)}>
          <div className="viz-modal-box viz-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="viz-modal-header">
              <h2 className="viz-modal-title">Choose Style</h2>
              <button className="viz-modal-close" onClick={() => setStyleModalOpen(false)}>✕</button>
            </div>
            <div className="viz-modal-tabs">
              {Object.keys(STYLE_TABS[activeInputType] ?? STYLE_TABS["interior-design"]).map(tab => (
                <button
                  key={tab}
                  className={`viz-modal-tab${styleTab === tab ? " viz-modal-tab-active" : ""}`}
                  onClick={() => setStyleTab(tab)}
                >{tab}</button>
              ))}
            </div>
            <div className="viz-modal-grid viz-modal-scroll">
              {((STYLE_TABS[activeInputType] ?? STYLE_TABS["interior-design"])[styleTab] ?? styleList).map(s => (
                <div
                  key={s}
                  className={`viz-modal-item${renderStyle === s ? " viz-modal-item-active" : ""}`}
                  onClick={() => { setRenderStyle(s); setStyleChosen(true); }}
                >
                  <div className="viz-modal-item-img">
                    <img src={getStyleImage(activeInputType, s)} alt={s} />
                    {renderStyle === s && <div className="viz-modal-item-check">✓</div>}
                  </div>
                  <span className="viz-modal-item-label">{s}</span>
                </div>
              ))}
            </div>
            <div className="viz-modal-footer viz-modal-footer-sticky">
              <button className="viz-modal-cancel" onClick={() => setStyleModalOpen(false)}>Cancel</button>
              <button className="viz-modal-confirm" onClick={() => setStyleModalOpen(false)}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {uploadModalOpen && (
        <div className="viz-modal-backdrop" onClick={() => { setUploadModalOpen(false); setSelectedAsset(null); }}>
          <div className="viz-upload-modal-box" onClick={e => e.stopPropagation()}>
            <div className="viz-modal-header">
              <h2 className="viz-modal-title">Add Photo</h2>
              <button className="viz-modal-close" onClick={() => { setUploadModalOpen(false); setSelectedAsset(null); }}>✕</button>
            </div>

            {/* Tabs */}
            <div className="viz-upload-modal-tabs">
              <button
                className={`viz-upload-modal-tab${uploadTab === "upload" ? " viz-upload-modal-tab-active" : ""}`}
                onClick={() => { setUploadTab("upload"); setSelectedAsset(null); }}
              >Upload</button>
              <button
                className={`viz-upload-modal-tab${uploadTab === "examples" ? " viz-upload-modal-tab-active" : ""}`}
                onClick={() => { setUploadTab("examples"); setSelectedAsset(null); }}
              >Examples</button>
            </div>

            <div className="viz-upload-modal-body">
              {uploadTab === "upload" ? (
                <div className="viz-upload-modal-upload-tab">
                  {/* Left: dropzone */}
                  <div
                    className={`viz-upload-modal-dropzone${isDraggingOver ? " viz-upload-modal-dropzone-active" : ""}`}
                    onClick={() => { sidebarFileRef.current?.click(); setUploadModalOpen(false); setSelectedAsset(null); }}
                    onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setIsDraggingOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDraggingOver(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); dragCounterRef.current = 0; setIsDraggingOver(false); if (!isAdminView && credits !== null && credits < 2) { setModalType("credits"); setUploadModalOpen(false); return; } const f = e.dataTransfer.files[0]; if (f) { handleSidebarFile(f); setUploadModalOpen(false); } }}
                  >
                    <div className="viz-upload-modal-dropzone-icon">
                      <UploadIcon size={26} strokeWidth={1.6} />
                    </div>
                    <span className="viz-upload-modal-dropzone-label">{isCreating ? "Creating…" : "Upload"}</span>
                    <span className="viz-upload-modal-dropzone-sub">PNG, JPG · Max 10MB</span>
                  </div>

                  {/* Right: asset thumbnails (project image + examples) */}
                  <div className="viz-upload-modal-assets">
                    {project?.originalImageUrl && (
                      <div
                        className={`viz-upload-modal-asset${selectedAsset === project.originalImageUrl ? " viz-upload-modal-asset-selected" : ""}`}
                        onClick={() => setSelectedAsset(prev => prev === project.originalImageUrl ? null : project.originalImageUrl)}
                      >
                        <img src={project.originalImageUrl} alt="Current" />
                        {selectedAsset === project.originalImageUrl && <div className="viz-upload-modal-asset-check">✓</div>}
                      </div>
                    )}
                    {(EXAMPLE_IMAGES[activeInputType] ?? EXAMPLE_IMAGES["interior-design"]).slice(0, project?.originalImageUrl ? 5 : 6).map(({ url, label }) => (
                      <div
                        key={url}
                        className={`viz-upload-modal-asset${selectedAsset === url ? " viz-upload-modal-asset-selected" : ""}`}
                        onClick={() => setSelectedAsset(prev => prev === url ? null : url)}
                      >
                        <img src={url} alt={label} />
                        {selectedAsset === url && <div className="viz-upload-modal-asset-check">✓</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Examples tab */
                <div className="viz-upload-modal-examples-grid">
                  {(EXAMPLE_IMAGES[activeInputType] ?? EXAMPLE_IMAGES["interior-design"]).map(({ url, label }) => (
                    <div
                      key={url}
                      className={`viz-upload-modal-example${selectedAsset === url ? " viz-upload-modal-asset-selected" : ""}`}
                      onClick={() => setSelectedAsset(prev => prev === url ? null : url)}
                    >
                      <div className="viz-upload-modal-example-img">
                        <img src={url} alt={label} />
                        {selectedAsset === url && <div className="viz-upload-modal-asset-check">✓</div>}
                      </div>
                      <span className="viz-upload-modal-example-label">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="viz-modal-footer">
              <button className="viz-modal-cancel" onClick={() => { setUploadModalOpen(false); setSelectedAsset(null); }}>Cancel</button>
              <button
                className="viz-modal-confirm"
                onClick={handleAssetConfirm}
                disabled={!selectedAsset}
                style={!selectedAsset ? { opacity: 0.45, cursor: "not-allowed" } : {}}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin View Banner */}
      {isAdminView && (
        <div style={{ background: "#7c3aed", color: "#fff", textAlign: "center", padding: "0.5rem", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.03em" }}>
          👁 Admin View — you are viewing this project as the user
        </div>
      )}

      <div className="viz-body">

      {/* ── Left icon nav ── */}
      {!embeddedId && <AppSidebar />}

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



        {/* Workspace: sidebar + output */}
        {/* ── Mobile top bar (credits + upgrade) ── */}
        {!embeddedId && (
          <div className="viz-mob-topbar">
            <div className="viz-mob-credits">
              <Zap size={13} strokeWidth={2.5} />
              <span>{credits ?? "—"} Credits</span>
            </div>
            <button className="viz-mob-upgrade" onClick={() => window.open("/pricing", "_blank")}>
              Upgrade ✦
            </button>
          </div>
        )}

        {/* ── Mobile tab bar ── */}
        {!embeddedId && (
          <div className="viz-mob-tabs">
            <button
              className={`viz-mob-tab${mobileTab === "generator" ? " viz-mob-tab-active" : ""}`}
              onClick={() => setMobileTab("generator")}
            >Generator</button>
            <button
              className={`viz-mob-tab${mobileTab === "history" ? " viz-mob-tab-active" : ""}`}
              onClick={() => setMobileTab("history")}
            >History</button>
          </div>
        )}

        <div className={`viz-workspace viz-workspace--${mobileTab}`}>

          {/* Sidebar */}
          <aside className="viz-sidebar">

            {/* Hidden file input — shared by upload card + upload modal */}
            <input
              ref={sidebarFileRef}
              type="file"
              accept=".jpg,.png"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSidebarFile(f); e.target.value = ""; }}
            />

            {activeInputType === "floor-plan-generator" ? (
              <div className="viz-opts">
                {/* Configure card */}
                <div className="viz-opt-card" onClick={() => setFpgConfigModalOpen(true)}>
                  <div className="viz-opt-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <span className="viz-opt-card-label">Configure</span>
                  <span className="viz-opt-card-value">{fpgConfig.propertyType} · {fpgConfig.area} {fpgConfig.areaUnit === "m2" ? "m²" : "sqft"}</span>
                  <button className="viz-opt-card-btn">Edit</button>
                </div>

                {/* Style card */}
                <div className="viz-opt-card" onClick={() => setFpgStyleModalOpen(true)}>
                  <div className="viz-opt-card-icon viz-opt-card-icon-thumb" style={{ background: "none", padding: 0 }}>
                    <img
                      src={getStyleImage("floor-plan-generator", fpgConfig.style === "blueprint" ? "Blueprint" : fpgConfig.style === "colored" ? "Colored" : fpgConfig.style === "isometric" ? "Isometric" : "3D Top-Down")}
                      alt={fpgConfig.style}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.75rem" }}
                    />
                  </div>
                  <span className="viz-opt-card-label">Style</span>
                  <span className="viz-opt-card-value">{fpgConfig.style === "blueprint" ? "Blueprint" : fpgConfig.style === "colored" ? "Colored" : fpgConfig.style === "isometric" ? "Isometric" : "3D Top-Down"}</span>
                  <button className="viz-opt-card-btn">Change</button>
                </div>
              </div>
            ) : (<>

              {/* ── Upload card ── */}
              <div
                className={`viz-upload-card${isDraggingOver ? " viz-upload-card-drag" : ""}`}
                onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setIsDraggingOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDraggingOver(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); dragCounterRef.current = 0; setIsDraggingOver(false); if (!isAdminView && credits !== null && credits < 2) { setModalType("credits"); return; } const f = e.dataTransfer.files[0]; if (f) handleSidebarFile(f); }}
              >
                {project?.originalImageUrl ? (
                  /* Photo already uploaded — show thumbnail */
                  <div className="viz-upload-preview">
                    <img src={project.originalImageUrl} alt="Uploaded" className="viz-upload-preview-img" />
                    <div className="viz-upload-preview-overlay">
                      <button
                        className="viz-upload-change-btn"
                        onClick={openUploadModal}
                      >
                        <UploadIcon size={14} />
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* No photo yet */
                  <>
                    <div className="viz-upload-card-icon">
                      <Home size={40} strokeWidth={1.2} style={{ color: "#9aaab8" }} />
                    </div>
                    <p className="viz-upload-card-title">Your dream room is one photo away</p>
                    <p className="viz-upload-card-sub">One photo. Infinite possibilities.</p>
                    <button
                      className="viz-upload-card-btn"
                      onClick={openUploadModal}
                      disabled={isCreating}
                    >
                      <UploadIcon size={16} />
                      {isCreating ? "Creating…" : "+ Add Photo"}
                    </button>
                  </>
                )}
              </div>

              {/* ── Option cards row ── */}
              <div className="viz-opt-row">

                {/* Room Type card — interior-design / empty-room only */}
                {!embeddedId && activeInputType !== "floor-plan" && activeInputType !== "outdoor" && (
                  <div className="viz-opt-card" onClick={() => setRoomTypeModalOpen(true)}>
                    <div className={`viz-opt-card-icon${roomTypeChosen ? " viz-opt-card-icon-thumb" : ""}`} style={roomTypeChosen ? { background: "none", padding: 0 } : { background: "none" }}>
                      {roomTypeChosen ? (
                        <>
                          <img
                            src={getRoomTypeImage(roomType)}
                            alt={roomType}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/card-room-after.webp"; }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.75rem" }}
                          />
                          <button
                            className="viz-opt-card-x"
                            onClick={(e) => { e.stopPropagation(); setRoomTypeChosen(false); }}
                          >✕</button>
                        </>
                      ) : (
                        <img src="/icon-room-type.png" alt="Room Type" width={52} height={52} style={{ objectFit: "contain" }} />
                      )}
                    </div>
                    <span className="viz-opt-card-label">Room Type</span>
                    <span className="viz-opt-card-value">{roomType}</span>
                    <button className="viz-opt-card-btn">{roomTypeChosen ? "Change" : "Select"}</button>
                  </div>
                )}

                {/* View Angle card — floor-plan only */}
                {activeInputType === "floor-plan" && (
                  <div className="viz-opt-card" onClick={() => setAngleModalOpen(true)}>
                    <div className="viz-opt-card-icon" style={{ background: "none" }}>
                      <img src="/icon-angle.png" alt="Angle" width={52} height={52} style={{ objectFit: "contain" }} />
                    </div>
                    <span className="viz-opt-card-label">Angle</span>
                    <span className="viz-opt-card-value">{ANGLE_LABELS[viewAngle] ?? viewAngle}</span>
                    <button className="viz-opt-card-btn">Select</button>
                  </div>
                )}

                {/* Style card */}
                <div className="viz-opt-card" onClick={() => setStyleModalOpen(true)}>
                  <div className={`viz-opt-card-icon${styleChosen ? " viz-opt-card-icon-thumb" : ""}`} style={styleChosen ? { background: "none", padding: 0 } : {}}>
                    {styleChosen ? (
                      <>
                        <img
                          src={getStyleImage(activeInputType, renderStyle)}
                          alt={renderStyle}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.75rem" }}
                        />
                        <button
                          className="viz-opt-card-x"
                          onClick={(e) => { e.stopPropagation(); setStyleChosen(false); }}
                        >✕</button>
                      </>
                    ) : (
                      <img src="/icon-room-type.png" alt="Style" width={52} height={52} style={{ objectFit: "contain" }} />
                    )}
                  </div>
                  <span className="viz-opt-card-label">Style</span>
                  <span className="viz-opt-card-value">{renderStyle}</span>
                  <button className="viz-opt-card-btn">{styleChosen ? "Change" : "Select"}</button>
                </div>


              </div>

            </>)}

            {/* ── Custom Requirements (floor-plan + floor-plan-generator only) ── */}
            {(activeInputType === "floor-plan" || activeInputType === "floor-plan-generator") && (
              <div className="viz-custom-prompt-wrap">
                <label className="viz-custom-prompt-label">
                  <span className="viz-custom-prompt-label-text">
                    <Sparkles size={13} strokeWidth={2.5} className="viz-custom-prompt-icon" />
                    Custom Requirements
                  </span>
                  <span className="viz-custom-prompt-count">{customPrompt.length}/1000</span>
                </label>
                <textarea
                  className="viz-custom-prompt-input"
                  placeholder="Describe specific needs, dimensions, or constraints..."
                  maxLength={1000}
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                />
              </div>
            )}

            {/* ── Generate (always pinned at bottom) ── */}
            <div className="viz-generate-wrap">
              {!embeddedId && project?.originalImageUrl && (
                <div className="viz-generate-img-count">
                  <UploadIcon size={13} />
                  1 image
                </div>
              )}
              <button
                className="viz-generate-btn"
                onClick={runGeneration}
                disabled={isProcessing || (!isAdminView && credits !== null && credits < 2) || (activeInputType !== "floor-plan-generator" && (isNewMode || !project))}
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
                    {currentImage ? "✦ Regenerate" : "✦ Generate"}
                  </SparklesText>
                )}
              </button>
              <div className="viz-credit-note">
                ⚡ Uses <span>2 credits</span> per generation
              </div>
            </div>

          </aside>

          {/* Right column: output card + history */}
          <div className="viz-output-col">
          <div className="viz-output-card" ref={previewCardRef}>

            {/* Comparison slider */}
            <div className="viz-compare-wrap">
              {/* Guest mode disabled */}
              {activeInputType === "floor-plan-generator" && currentImage ? (
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
                        color: "var(--brand-color)",
                      }}
                      linesStyle={{ background: "var(--brand-color)", width: 3, opacity: 0.9 }}
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
                          buttonStyle={{ background: "#fff", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,0.25)", color: "var(--brand-color)" }}
                          linesStyle={{ background: "var(--brand-color)", width: 3, opacity: 0.9 }}
                        />
                      }
                      itemOne={<ReactCompareSliderImage src={fb.before} alt="Before" style={{ objectFit: "cover" }} />}
                      itemTwo={<ReactCompareSliderImage src={fb.after}  alt="After"  style={{ objectFit: "cover" }} />}
                    />
                    <div className="viz-compare-label viz-label-left">{fb.labelBefore}</div>
                    <div className="viz-compare-label viz-label-right">{fb.labelAfter}</div>
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
                  <video
                    src="/myhomestyler-loader.mp4"
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover scale-[1.32]"
                  />
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40, padding: "1.5rem 1rem 1.1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", background: "linear-gradient(to top, rgba(10,10,14,0.78) 0%, rgba(10,10,14,0.3) 55%, transparent 100%)" }}>
                    <AITextLoading texts={LOADING_TEXTS[activeInputType] ?? LOADING_TEXTS["floor-plan"]} />
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.03em" }}>This usually takes under a minute</p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Preview action bar ── */}
          {currentImage && !isProcessing && !embeddedId && (
            <div className="viz-preview-actions">
              <ExpandButton onClick={() => setLightboxOpen(true)} />
              {project?.originalImageUrl && (
                <CompareButton
                  onClick={() => { setHistoryModalWithCompare(true); setHistoryModal({ ...project, renderedImageUrl: currentImage }); }}
                />
              )}
              <ExportButton
                imageUrl={currentImage}
                fileName={project?.name}
                hasPurchased={hasPurchased}
                isAdminView={isAdminView}
                projectId={project?._id}
              />
              {project?._id && (
                <ShareButton projectId={project._id} imageUrl={currentImage} fileName={project?.name} />
              )}
            </div>
          )}

          {/* ── My Renders — all user projects with a rendered image ── */}
          {!embeddedId && userProjects.length > 0 && (
            <div className="viz-history-section">
              <div className="viz-history-header">
                <span className="viz-history-title">My Renders</span>
                <span className="viz-history-count">{userProjects.length}</span>
              </div>
              <div className="viz-history-grid">
                {userProjects.map((p) => {
                  const isActive = p._id === project?._id;
                  return (
                    <div
                      key={p._id}
                      className={`viz-history-card${isActive ? " viz-history-card-active" : ""}`}
                      onClick={() => { setHistoryModalWithCompare(false); handleMobileHistoryTap(p); }}
                    >
                      <div className="viz-history-card-img">
                        <img src={p.renderedImageUrl} alt={p.name} onContextMenu={e => e.preventDefault()} />
                        <div className="viz-history-card-overlay">
                          <button
                            className="viz-hc-action"
                            title="Preview"
                            onClick={(e) => { e.stopPropagation(); handleMobileHistoryTap(p); }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        </div>
                        <div className="viz-history-card-info">
                          {p.renderStyle && <span className="viz-hc-style">{p.renderStyle}</span>}
                          <span className="viz-hc-date">{new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                      {isActive && <div className="viz-history-card-active-bar" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          </div>{/* end viz-output-col */}

        </div>{/* end viz-workspace */}


        {/* ── Mobile sticky generate bar ── */}
        {!embeddedId && !roomTypeModalOpen && !styleModalOpen && !angleModalOpen && !fpgConfigModalOpen && !fpgStyleModalOpen && (
          <div className="viz-mob-generate-bar">
            {mobileTab === "history" && currentImage ? (
              <>
                <ExportButton
                  imageUrl={currentImage}
                  fileName={project?.name}
                  hasPurchased={hasPurchased}
                  isAdminView={isAdminView}
                  projectId={project?._id}
                />
                <button
                  className="viz-mob-generate-btn"
                  onClick={() => setMobileTab("generator")}
                >
                  <Zap size={15} strokeWidth={2.5} />
                  Regenerate
                </button>
              </>
            ) : (
              <>
                <div className="viz-mob-generate-count">
                  <UploadIcon size={13} />
                  {project?.originalImageUrl ? "1 image" : "No image"}
                </div>
                <button
                  className="viz-mob-generate-btn"
                  onClick={runGeneration}
                  disabled={isProcessing || (activeInputType !== "floor-plan-generator" && (isNewMode || !project))}
                >
                  <Zap size={15} strokeWidth={2.5} />
                  {isProcessing ? "Generating…" : "Generate"}
                </button>
              </>
            )}
          </div>
        )}

      </main>

      </div>{/* end viz-body */}

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
                {modalType === "suspended" ? "Account Suspended" : modalType === "credits" ? "Out of Credits" : "Generation Failed"}
              </h3>
              <p className="viz-modal-text">
                {modalType === "suspended"
                  ? "Your account has been suspended and you cannot generate new renders. For more information please contact us at myhomestylercom@gmail.com"
                  : modalType === "credits"
                  ? "You have reached your limit of 3D renders. Upgrade your plan to continue transforming floor plans."
                  : "Something went wrong while processing your render. Please try again or contact support if the problem persists."}
              </p>
            </div>
            <div className="viz-modal-actions">
              {modalType === "suspended" ? (
                <>
                  <a className="viz-modal-btn-primary" href="mailto:myhomestylercom@gmail.com">
                    Contact Support
                  </a>
                  <button className="viz-modal-btn-secondary" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                  </button>
                </>
              ) : modalType === "credits" ? (
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

      {/* ── History render modal ── */}
      {historyModal && (
        <ProjectModal
          project={historyModal}
          onClose={() => { setHistoryModal(null); setHistoryModalWithCompare(false); }}
          defaultShowSlider={historyModalWithCompare}
        />
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

    </div>
  );
}
