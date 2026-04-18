"use client";

import "../app/dashboard/dashboard.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getUserInfo } from "@/lib/actions";
import { Calendar, X, Trash2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import ExpandButton from "@/components/ui/ExpandButton";
import CompareButton from "@/components/ui/CompareButton";
import ShareButton from "@/components/ui/ShareButton";
import ExportButton from "@/components/ui/ExportButton";

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
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  defaultShowSlider?: boolean;
}

export default function ProjectModal({
  project,
  onClose,
  onDelete,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  defaultShowSlider = false,
}: ProjectModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [fullscreen, setFullscreen] = useState(false);
  const [showSlider, setShowSlider] = useState(defaultShowSlider);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserInfo(user.id).then(d => setHasPurchased(d.hasPurchased));
  }, [user]);

  const imageUrl = project.renderedImageUrl || project.originalImageUrl;

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
              <ExpandButton active={fullscreen} onClick={() => setFullscreen(f => !f)} />
              {project.renderedImageUrl && project.originalImageUrl && (
                <CompareButton active={showSlider} onClick={() => setShowSlider(s => !s)} />
              )}
              <ShareButton projectId={project._id} imageUrl={imageUrl} fileName={project.name} />
            </div>
          </div>

          {/* Right: info panel */}
          <div className="pj-modal-panel">

            {/* Input type title */}
            <div className="pj-modal-panel-header">
              <span className="pj-modal-panel-name">
                {project.inputType === "floor-plan"           ? "Blueprint → 3D"
                 : project.inputType === "interior-design"    ? "Interior Redesign"
                 : project.inputType === "outdoor"            ? "Garden & Yard Design"
                 : project.inputType === "empty-room"         ? "Virtual Staging"
                 : project.inputType === "floor-plan-generator" ? "Floor Plan Generator"
                 : project.name}
              </span>
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
              <ExportButton
                imageUrl={imageUrl}
                fileName={project.name}
                hasPurchased={hasPurchased}
                projectId={project._id}
                className="pj-export-full"
              />
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
