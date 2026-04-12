"use client";

import "../app/dashboard/dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getUserInfo } from "@/lib/actions";
import { Calendar, X, Download, Share2, Trash2, Maximize2, ArrowLeftRight, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { SparklesText } from "@/components/ui/sparkles-text";

export interface ProjectModalProject {
  _id: string;
  name: string;
  renderedImageUrl?: string;
  originalImageUrl?: string;
  createdAt: string;
  renderStyle?: string;
  inputType?: string;
  roomType?: string;
  viewAngle?: string;
  status?: string;
}

interface ProjectModalProps {
  project: ProjectModalProject;
  onClose: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ProjectModal({
  project,
  onClose,
  onDelete,
  onShare,
  onDownload,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: ProjectModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [fullscreen, setFullscreen] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "pdf">("png");
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserInfo(user.id).then(d => setHasPurchased(d.hasPurchased));
  }, [user]);

  const imageUrl = project.renderedImageUrl || project.originalImageUrl;

  async function handleShare() {
    if (onShare) { onShare(); return; }
    const src = imageUrl;
    if (!src) return;

    // Try Web Share API with the actual image file
    if (navigator.share) {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const ext = blob.type.includes("png") ? "png" : "jpg";
        const file = new File([blob], `${project.name || "render"}.${ext}`, { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: project.name || "My Render" });
          return;
        }
        // Fallback: share URL if file sharing not supported
        await navigator.share({ title: project.name || "My Render", url: `${window.location.origin}/visualizer/${project._id}` });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // user cancelled
      }
    }

    // Fallback: copy link silently
    await navigator.clipboard.writeText(`${window.location.origin}/visualizer/${project._id}`);
  }

  const handleFreeDownload = async (fmt: "png" | "jpg" | "pdf" = exportFormat) => {
    if (onDownload) { onDownload(); return; }
    const src = imageUrl;
    if (!src) return;
    setExportDropdownOpen(false);
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = hasPurchased ? img.width : 1024;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!hasPurchased) {
        const wFontSize = Math.max(20, Math.round(canvas.width * 0.048));
        ctx.save();
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
          pdf.save(`${project.name || "render"}.pdf`);
        });
      } else if (!hasPurchased) {
        const link = document.createElement("a");
        link.download = `${project.name || "render"}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.55);
        link.click();
      } else {
        const isPng = fmt === "png";
        const link = document.createElement("a");
        link.download = `${project.name || "render"}.${fmt}`;
        link.href = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", isPng ? 1 : 0.85);
        link.click();
      }
    };
    img.onerror = () => { if (src) window.open(src, "_blank"); };
    img.src = src;
  };

  const metaRows: { key: string; val: string; color?: string }[] = [];
  if (project.renderStyle)  metaRows.push({ key: "Style",      val: project.renderStyle });
  if (project.roomType)     metaRows.push({ key: "Room",       val: project.roomType });
  if (project.inputType)    metaRows.push({ key: "Type",       val: project.inputType.replace(/-/g, " ") });
  if (project.viewAngle)    metaRows.push({ key: "Angle",      val: project.viewAngle.replace(/-/g, " ") });
  metaRows.push({
    key: "Status",
    val: project.renderedImageUrl ? "Completed" : "Processing",
    color: project.renderedImageUrl ? "#10b981" : "#f59e0b",
  });

  return (
    <div className="pj-modal-backdrop" onClick={onClose}>
      <div className={`pj-modal${fullscreen ? " pj-modal-fullscreen" : ""}`} onClick={e => e.stopPropagation()}>

        {/* Top bar */}
        <div className="pj-modal-topbar">
          <div className="pj-topbar-icons">
            <button className="pj-topbar-btn" title="Share" onClick={handleShare}><Share2 size={15} /></button>
            {onDelete && (
              <button className="pj-topbar-btn pj-topbar-btn-danger" title="Delete" onClick={onDelete}><Trash2 size={15} /></button>
            )}
          </div>
          <button className="pj-topbar-btn pj-topbar-close" title="Close" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Body */}
        <div className="pj-modal-body">

          {/* Left: image */}
          <div className="pj-modal-img-col">
            <div className="pj-modal-img-wrap">
              <button className="pj-modal-back-link" onClick={onClose}>
                <ChevronLeft size={13} /> Back
              </button>

              {showSlider && project.renderedImageUrl && project.originalImageUrl ? (
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex" }}>
                  <img src={project.originalImageUrl} alt="Before" style={{ width: "50%", height: "100%", objectFit: "cover" }} />
                  <img src={project.renderedImageUrl} alt="After" style={{ width: "50%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 3, background: "#ec5b13", transform: "translateX(-50%)" }} />
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={project.name}
                  className="pj-modal-img"
                  onContextMenu={e => e.preventDefault()}
                />
              )}

              {hasPrev && (
                <button className="pj-modal-arrow pj-modal-arrow-left" onClick={e => { e.stopPropagation(); onPrev?.(); setShowSlider(false); }}>
                  <ChevronLeft size={20} />
                </button>
              )}
              {hasNext && (
                <button className="pj-modal-arrow pj-modal-arrow-right" onClick={e => { e.stopPropagation(); onNext?.(); setShowSlider(false); }}>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="pj-modal-img-footer">
              <button className={`pj-img-footer-btn${fullscreen ? " pj-img-footer-btn-active" : ""}`} onClick={() => setFullscreen(f => !f)}>
                <Maximize2 size={14} /><span>Expand</span>
              </button>
              {project.renderedImageUrl && project.originalImageUrl && (
                <button className={`pj-img-footer-btn${showSlider ? " pj-img-footer-btn-active" : ""}`} onClick={() => setShowSlider(s => !s)}>
                  <ArrowLeftRight size={14} /><span>Compare</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: info panel */}
          <div className="pj-modal-panel">

            {/* Name */}
            <div className="pj-modal-panel-header">
              <span className="pj-modal-panel-name">{project.name}</span>
            </div>

            {/* Thumbnail */}
            <div className="pj-modal-panel-thumb">
              <img src={imageUrl} alt={project.name} onContextMenu={e => e.preventDefault()} />
            </div>

            {/* Date */}
            <span className="pj-modal-panel-date" style={{ padding: "0.3rem 1rem 0", display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={10} />
              {new Date(project.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              {" · "}
              {new Date(project.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>

            {/* Metadata */}
            <div className="pj-modal-panel-meta">
              {metaRows.map(({ key, val, color }) => (
                <div key={key} className="pj-modal-panel-meta-row">
                  <span className="pj-modal-panel-meta-key">{key}</span>
                  <span className="pj-modal-panel-meta-val" style={color ? { color } : undefined}>{val}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pj-modal-panel-actions">

              {/* Inline export options — shown above button when open */}
              {exportDropdownOpen && (
                <div style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>Export options</p>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {(["png", "jpg", "pdf"] as const).map(fmt => (
                      <label
                        key={fmt}
                        className={`viz-export-fmt${exportFormat === fmt ? " viz-export-fmt-active" : ""}${fmt === "pdf" && !hasPurchased ? " viz-export-fmt-locked" : ""}`}
                        style={{ flex: 1, justifyContent: "center", padding: "0.4rem 0.3rem" }}
                        onClick={() => {
                          if (fmt === "pdf" && !hasPurchased) { window.open("/pricing", "_blank"); }
                          else { setExportFormat(fmt); }
                        }}
                      >
                        <input type="radio" name="pj-exportFormat" value={fmt} checked={exportFormat === fmt} readOnly disabled={fmt === "pdf" && !hasPurchased} style={{ accentColor: "#ec5b13" }} />
                        <span className="viz-export-fmt-label">{fmt.toUpperCase()}</span>
                        {fmt === "pdf" && !hasPurchased && <span className="viz-export-pro-badge">👑</span>}
                      </label>
                    ))}
                  </div>
                  <p className="viz-export-desc" style={{ margin: 0 }}>
                    {exportFormat === "pdf"
                      ? "Export as a print-ready PDF document."
                      : exportFormat === "jpg"
                      ? "Smaller file size, great for sharing online."
                      : "Standard quality · Upgrade for HD lossless."}
                  </p>
                  <button className="viz-export-dl-btn" style={{ marginBottom: 0 }} onClick={() => handleFreeDownload()}>
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

              {/* Export trigger button */}
              <button
                className="viz-download-btn"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={!imageUrl}
                onClick={() => setExportDropdownOpen(o => !o)}
              >
                <Download size={12} strokeWidth={2.5} />
                <SparklesText className="viz-download-sparkles-text" sparklesCount={4} colors={{ first: "#ffffff", second: "#e2e8f0" }}>
                  Export
                </SparklesText>
                <div className="viz-download-shimmer" />
              </button>

              <button className="pj-panel-btn-primary" onClick={() => router.push(`/visualizer/${project._id}`)}>
                <ExternalLink size={13} /> Open in Studio
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
