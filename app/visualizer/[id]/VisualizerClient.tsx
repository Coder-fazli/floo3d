"use client";

import "./visualizer.css";
import NextImage from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { getCredits, getUserInfo } from "@/lib/actions";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getProject, getProjects } from "@/lib/actions";
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from "react-compare-slider";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from "next/image";
import Link from "next/link";
import { Download, Upload as UploadIcon, Sparkles, X, ExternalLink, Home, Zap } from "lucide-react";
import ProjectModal from "@/components/ProjectModal";
import AppSidebar from "@/components/AppSidebar";
import { HoleBackground } from "@/components/animate-ui/components/backgrounds/hole";
import { SparklesText } from "@/components/ui/sparkles-text";
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

  // Guest mode (embedded pages, no login)
  const GUEST_CREDITS_KEY = "guest_credits";
  const GUEST_CREDITS_DEFAULT = 6;
  const [guestBase64, setGuestBase64] = useState<string | null>(null);
  const [guestResult, setGuestResult] = useState<string | null>(null);
  const [guestCredits, setGuestCredits] = useState(GUEST_CREDITS_DEFAULT);

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

  useEffect(() => {
    if (!embeddedId) return;
    const stored = localStorage.getItem(GUEST_CREDITS_KEY);
    if (stored === null) localStorage.setItem(GUEST_CREDITS_KEY, String(GUEST_CREDITS_DEFAULT));
    else setGuestCredits(Math.max(0, parseInt(stored) || 0));
  }, [embeddedId]);

  const runGeneration = async () => {
    if (isProcessing) return;
    setMobileTab("history");

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
        setMobileTab("history");
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
  const [mobileCompareOpen, setMobileCompareOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "pdf">("png");
  const [previewExportOpen, setPreviewExportOpen] = useState(false);
  const [previewSharePopover, setPreviewSharePopover] = useState(false);
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
      const maxW = (hasPurchased || isAdminView) ? img.width : 1024;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Watermark — only for free users, never for admin
      if (!hasPurchased && !isAdminView) {
        const wFontSize = Math.max(20, Math.round(canvas.width * 0.048));
        ctx.save();
        // Shadow for contrast on any background
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = wFontSize * 0.6;
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 ${wFontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("MyHomeStyler.com", canvas.width * 0.5, canvas.height * 0.5);
        ctx.restore();
      }

      if (fmt === "pdf") {
        import("jspdf").then(({ jsPDF }) => {
          const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "px", format: [canvas.width, canvas.height] });
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
          pdf.save(`${project?.name || "render"}.pdf`);
        });
      } else if (!hasPurchased && !isAdminView) {
        // Free users: JPEG at reduced quality only
        const link = document.createElement("a");
        link.download = `${project?.name || "render"}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.55);
        link.click();
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

  const handlePreviewCopyLink = async () => {
    const url = `${window.location.origin}/visualizer/${id}`;
    await navigator.clipboard.writeText(url);
    setPreviewSharePopover(false);
    alert("Link copied!");
  };

  const handlePreviewShareImage = async () => {
    if (!currentImage) return;
    setPreviewSharePopover(false);
    try {
      const res = await fetch(currentImage);
      const blob = await res.blob();
      const file = new File([blob], "render.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: project?.name ?? "My Render" });
        return;
      }
    } catch {}
    window.open(currentImage, "_blank");
  };

  const handlePreviewShareTwitter = () => {
    const url = `${window.location.origin}/visualizer/${id}`;
    window.open(`https://twitter.com/intent/tweet?text=Check+out+my+AI+render&url=${encodeURIComponent(url)}`, "_blank");
    setPreviewSharePopover(false);
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
                  style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", background: "#ec5b13", color: "#fff", border: "none", borderRadius: "0.75rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}
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
                        borderColor: fpgConfig.propertyType === t ? "#ec5b13" : "#e2e8f0",
                        background: fpgConfig.propertyType === t ? "rgba(236,91,19,0.08)" : "#f8fafc",
                        color: fpgConfig.propertyType === t ? "#ec5b13" : "#64748b" }}
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
                        borderColor: fpgConfig.extras[key] ? "#ec5b13" : "#e2e8f0",
                        background: fpgConfig.extras[key] ? "rgba(236,91,19,0.08)" : "#f8fafc",
                        color: fpgConfig.extras[key] ? "#ec5b13" : "#64748b" }}
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
              {Object.entries(ANGLE_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className={`viz-modal-item${viewAngle === key ? " viz-modal-item-active" : ""}`}
                  onClick={() => setViewAngle(key)}
                >
                  <div className="viz-modal-item-img">
                    <img src={getAngleImage(key)} alt={label} onError={(e) => { (e.target as HTMLImageElement).src = "/real-3d-render.jpg"; }} />
                    {viewAngle === key && <div className="viz-modal-item-check">✓</div>}
                  </div>
                  <span className="viz-modal-item-label">{label}</span>
                </div>
              ))}
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
                    onDrop={(e) => { e.preventDefault(); dragCounterRef.current = 0; setIsDraggingOver(false); const f = e.dataTransfer.files[0]; if (f) { handleSidebarFile(f); setUploadModalOpen(false); } }}
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
                  Sign up free → get 4 credits
                </button>
                {" "}· no credit card needed
              </span>
            )}
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
                onDrop={(e) => { e.preventDefault(); dragCounterRef.current = 0; setIsDraggingOver(false); const f = e.dataTransfer.files[0]; if (f) handleSidebarFile(f); }}
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
                        <img src="/icon-room-type.png" alt="Room Type" width={36} height={36} style={{ objectFit: "contain" }} />
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
                    <div className="viz-opt-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
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
                      <Sparkles size={24} strokeWidth={1.6} />
                    )}
                  </div>
                  <span className="viz-opt-card-label">Style</span>
                  <span className="viz-opt-card-value">{renderStyle}</span>
                  <button className="viz-opt-card-btn">{styleChosen ? "Change" : "Select"}</button>
                </div>


              </div>

            </>)}

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

          {/* Right column: output card + history */}
          <div className="viz-output-col">
          <div className="viz-output-card" ref={previewCardRef}>

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
                  <HoleBackground className="absolute inset-0 before:![background:radial-gradient(ellipse_at_50%_55%,transparent_10%,black_50%)]" />
                  <div style={{ position: "relative", zIndex: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <AITextLoading texts={LOADING_TEXTS[activeInputType] ?? LOADING_TEXTS["floor-plan"]} />
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.03em" }}>This usually takes under a minute</p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Preview action bar ── */}
          {currentImage && !isProcessing && !embeddedId && (
            <div className="viz-preview-actions">

              {/* Mobile-only: Expand */}
              <button className="pj-img-footer-btn viz-preview-mob-only" onClick={() => setLightboxOpen(true)}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                <span>Expand</span>
              </button>

              {/* Mobile-only: Compare */}
              {project?.originalImageUrl && (
                <button className="pj-img-footer-btn viz-preview-mob-only" onClick={() => setMobileCompareOpen(true)}>
                  <svg width="28" height="28" viewBox="0 0 512 512" fill="currentColor"><path d="M75 92v328h362V92H75zm322 288H115V132h282v248zM181 204a25 25 0 1 0 0-50 25 25 0 0 0 0 50zm-46 136 70-96 46 64 34-46 72 78H135zM0 142h55v228H0zm457 0h55v228h-55zM96 420h320v50H96zm46 62h18v30h-18zm36 0h18v30h-18zm36 0h18v30h-18zm36 0h18v30h-18zm36 0h18v30h-18zM66 450H18l24-30 24 30zm380 0 24-30 24 30h-48z"/></svg>
                  <span>Compare</span>
                </button>
              )}

              {/* Export — exact same button + dropdown as ProjectModal */}
              <div className="viz-preview-export-wrap" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {previewExportOpen && (
                  <div style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>Export options</p>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      {(["png", "jpg", "pdf"] as const).map(fmt => (
                        <label
                          key={fmt}
                          className={`viz-export-fmt${exportFormat === fmt ? " viz-export-fmt-active" : ""}${fmt === "pdf" && !hasPurchased ? " viz-export-fmt-locked" : ""}`}
                          style={{ flex: 1, justifyContent: "center", padding: "0.4rem 0.3rem" }}
                          onClick={() => { if (fmt === "pdf" && !hasPurchased) { window.open("/pricing", "_blank"); } else { setExportFormat(fmt); } }}
                        >
                          <input type="radio" name="preview-exportFormat" value={fmt} checked={exportFormat === fmt} readOnly disabled={fmt === "pdf" && !hasPurchased} style={{ accentColor: "#ec5b13" }} />
                          <span className="viz-export-fmt-label">{fmt.toUpperCase()}</span>
                          {fmt === "pdf" && !hasPurchased && <span className="viz-export-pro-badge">👑</span>}
                        </label>
                      ))}
                    </div>
                    <p className="viz-export-desc" style={{ margin: 0 }}>
                      {exportFormat === "pdf" ? "Export as a print-ready PDF document." : exportFormat === "jpg" ? "Smaller file size, great for sharing online." : "Standard quality · Upgrade for HD lossless."}
                    </p>
                    <button className="viz-export-dl-btn" style={{ marginBottom: 0 }} onClick={() => { handleFreeDownload(exportFormat); setPreviewExportOpen(false); }}>
                      <Download size={13} strokeWidth={2.5} /> Download {exportFormat.toUpperCase()}
                    </button>
                    {hasPurchased ? (
                      <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: "#16a34a", textAlign: "center" }}>🔓 HD quality · Commercial use unlocked</p>
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8", textAlign: "center", lineHeight: 1.4 }}>
                        Personal use only · <a href="/pricing" target="_blank" rel="noopener noreferrer" style={{ color: "#ec5b13", fontWeight: 700, textDecoration: "none" }}>Upgrade for HD</a>
                      </p>
                    )}
                  </div>
                )}
                <button
                  className="viz-download-btn"
                  onClick={() => { setPreviewExportOpen(o => !o); setPreviewSharePopover(false); }}
                >
                  <Download size={12} strokeWidth={2.5} />
                  <SparklesText className="viz-download-sparkles-text" sparklesCount={4} colors={{ first: "#ffffff", second: "#e2e8f0" }}>
                    Export
                  </SparklesText>
                  <div className="viz-download-shimmer" />
                </button>
              </div>

              {/* Share — same pj-img-footer-btn as modal */}
              <div style={{ position: "relative" }}>
                <button
                  className={`pj-img-footer-btn${previewSharePopover ? " pj-img-footer-btn-active" : ""}`}
                  onClick={() => { setPreviewSharePopover(o => !o); setPreviewExportOpen(false); }}
                >
                  <svg width="28" height="28" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round"><path d="M368 32l112 112-112 112V192c-96 0-192 32-224 128 0-128 64-240 224-256V32z"/><path d="M432 368v80a32 32 0 0 1-32 32H80a32 32 0 0 1-32-32V144a32 32 0 0 1 32-32h80"/></svg>
                  <span>Share</span>
                </button>
                {previewSharePopover && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 149 }} onClick={() => setPreviewSharePopover(false)} />
                    <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "#fff", borderRadius: "0.875rem", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "0.5rem", display: "flex", gap: "0.25rem", zIndex: 200, whiteSpace: "nowrap" }}>
                      <button onClick={handlePreviewCopyLink} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", padding: "0.6rem 0.75rem", background: "none", border: "none", cursor: "pointer", borderRadius: "0.625rem", fontSize: "0.68rem", fontWeight: 600, color: "#0f172a", fontFamily: "inherit" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        Copy link
                      </button>
                      <button onClick={handlePreviewShareImage} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", padding: "0.6rem 0.75rem", background: "none", border: "none", cursor: "pointer", borderRadius: "0.625rem", fontSize: "0.68rem", fontWeight: 600, color: "#0f172a", fontFamily: "inherit" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        Share Image
                      </button>
                      <button onClick={handlePreviewShareTwitter} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", padding: "0.6rem 0.75rem", background: "none", border: "none", cursor: "pointer", borderRadius: "0.625rem", fontSize: "0.68rem", fontWeight: 600, color: "#0f172a", fontFamily: "inherit" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        X
                      </button>
                    </div>
                  </>
                )}
              </div>

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
                      onClick={() => handleMobileHistoryTap(p)}
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

        {/* ── Mobile export sheet ── */}
        {exportDropdownOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 149 }} onClick={() => setExportDropdownOpen(false)} />
            <div className="viz-mob-export-sheet">
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>Export image</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["png", "jpg", "pdf"] as const).map(fmt => {
                  const locked = fmt === "pdf" && !hasPurchased;
                  return (
                    <label
                      key={fmt}
                      className={`viz-export-fmt${exportFormat === fmt ? " viz-export-fmt-active" : ""}${locked ? " viz-export-fmt-locked" : ""}`}
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => { if (locked) { window.open("/pricing", "_blank"); } else { setExportFormat(fmt); } }}
                    >
                      <input type="radio" name="mob-fmt" value={fmt} checked={exportFormat === fmt} readOnly disabled={locked} style={{ accentColor: "#ec5b13" }} />
                      <span className="viz-export-fmt-label">{fmt.toUpperCase()}</span>
                      {locked && <span className="viz-export-pro-badge">👑</span>}
                    </label>
                  );
                })}
              </div>
              <button className="viz-export-dl-btn" style={{ marginBottom: 0 }} onClick={() => handleFreeDownload(exportFormat)}>
                <Download size={13} strokeWidth={2.5} /> Download {exportFormat.toUpperCase()}
              </button>
            </div>
          </>
        )}

        {/* ── Mobile sticky generate bar ── */}
        {!embeddedId && !roomTypeModalOpen && !styleModalOpen && !angleModalOpen && !fpgConfigModalOpen && !fpgStyleModalOpen && (
          <div className="viz-mob-generate-bar">
            {mobileTab === "history" && currentImage ? (
              <>
                <button
                  className="viz-mob-export-btn"
                  onClick={() => setExportDropdownOpen(o => !o)}
                >
                  <Download size={15} strokeWidth={2.5} />
                  Export
                </button>
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

      {/* ── Mobile compare modal ── */}
      {mobileCompareOpen && project?.originalImageUrl && currentImage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "#000", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "rgba(0,0,0,0.7)" }}>
            <span style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>Before / After</span>
            <button onClick={() => setMobileCompareOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ReactCompareSlider
              defaultValue={50}
              style={{ width: "100%", height: "100%" }}
              handle={<ReactCompareSliderHandle buttonStyle={{ background: "#fff", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,0.25)", color: "#ec5b13" }} linesStyle={{ background: "#ec5b13", width: 3, opacity: 0.9 }} />}
              itemOne={<ReactCompareSliderImage src={project.originalImageUrl} alt="Original" style={{ objectFit: "contain", background: "#111" }} />}
              itemTwo={<ReactCompareSliderImage src={currentImage} alt="Result" style={{ objectFit: "contain", background: "#111" }} />}
            />
          </div>
        </div>
      )}

      {/* ── History render modal ── */}
      {historyModal && (
        <ProjectModal
          project={historyModal}
          onClose={() => setHistoryModal(null)}
          onDownload={() => downloadHistoryImage(historyModal.renderedImageUrl, historyModal.name || "render", historyModal._id)}
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
