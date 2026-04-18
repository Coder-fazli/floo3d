"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { SparklesText } from "@/components/ui/sparkles-text";
import "./render-buttons.css";

interface ExportButtonProps {
  imageUrl: string | null | undefined;
  fileName?: string;
  hasPurchased: boolean;
  isAdminView?: boolean;
  projectId?: string;
  className?: string;
}

export default function ExportButton({
  imageUrl,
  fileName = "render",
  hasPurchased,
  isAdminView = false,
  projectId,
  className,
}: ExportButtonProps) {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [format, setFormat] = useState<"png" | "jpg" | "pdf">("png");

  const trackDownload = () => {
    if (!projectId) return;
    fetch("/api/track-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
  };

  const handleDownload = (fmt: "png" | "jpg" | "pdf") => {
    const src = imageUrl;
    if (!src) return;
    setDesktopOpen(false);
    setMobileOpen(false);
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = hasPurchased || isAdminView ? img.width : 1024;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!hasPurchased && !isAdminView) {
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
          const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? "landscape" : "portrait",
            unit: "px",
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
          pdf.save(`${fileName}.pdf`);
        });
      } else if (!hasPurchased && !isAdminView) {
        const link = document.createElement("a");
        link.download = `${fileName}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.55);
        link.click();
      } else {
        const isPng = fmt === "png";
        const link = document.createElement("a");
        link.download = `${fileName}.${fmt}`;
        link.href = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", isPng ? 1 : 0.85);
        link.click();
      }
    };
    img.onerror = () => { if (src) window.open(src, "_blank"); };
    img.src = src;
    trackDownload();
  };

  const formatKey = projectId ?? "rb";

  const Panel = () => (
    <div className="rb-export-panel">
      <p className="rb-export-panel-title">Export options</p>
      <div className="rb-export-fmts">
        {(["png", "jpg", "pdf"] as const).map(fmt => (
          <label
            key={fmt}
            className={`viz-export-fmt${format === fmt ? " viz-export-fmt-active" : ""}${fmt === "pdf" && !hasPurchased && !isAdminView ? " viz-export-fmt-locked" : ""}`}
            style={{ flex: 1, justifyContent: "center", padding: "0.4rem 0.3rem" }}
            onClick={() => {
              if (fmt === "pdf" && !hasPurchased && !isAdminView) window.open("/pricing", "_blank");
              else setFormat(fmt);
            }}
          >
            <input
              type="radio"
              name={`rb-fmt-${formatKey}`}
              value={fmt}
              checked={format === fmt}
              readOnly
              disabled={fmt === "pdf" && !hasPurchased && !isAdminView}
              style={{ accentColor: "#ec5b13" }}
            />
            <span className="viz-export-fmt-label">{fmt.toUpperCase()}</span>
            {fmt === "pdf" && !hasPurchased && !isAdminView && <span className="viz-export-pro-badge">👑</span>}
          </label>
        ))}
      </div>
      <p className="viz-export-desc">
        {format === "pdf"
          ? "Export as a print-ready PDF document."
          : format === "jpg"
          ? "Smaller file size, great for sharing online."
          : "Standard quality · Upgrade for HD lossless."}
      </p>
      <button className="viz-export-dl-btn" onClick={() => handleDownload(format)}>
        <Download size={13} strokeWidth={2.5} /> Download {format.toUpperCase()}
      </button>
      {hasPurchased || isAdminView ? (
        <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: "#16a34a", textAlign: "center" }}>
          🔓 HD quality · Commercial use unlocked
        </p>
      ) : (
        <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8", textAlign: "center", lineHeight: 1.4 }}>
          Personal use only ·{" "}
          <a href="/pricing" target="_blank" rel="noopener noreferrer" style={{ color: "#ec5b13", fontWeight: 700, textDecoration: "none" }}>
            Upgrade for HD
          </a>
        </p>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className={`rb-export-wrap${className ? ` ${className}` : ""}`}>
        {desktopOpen && <Panel />}
        <button
          className="viz-download-btn"
          onClick={() => setDesktopOpen(o => !o)}
          disabled={!imageUrl}
        >
          <Download size={12} strokeWidth={2.5} />
          <SparklesText className="viz-download-sparkles-text" sparklesCount={4} colors={{ first: "#ffffff", second: "#e2e8f0" }}>
            Export
          </SparklesText>
          <div className="viz-download-shimmer" />
        </button>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 159 }} onClick={() => setMobileOpen(false)} />
          <div className="rb-mob-export-sheet">
            <Panel />
          </div>
        </>
      )}
      <button className="rb-mob-export-btn" onClick={() => setMobileOpen(o => !o)} disabled={!imageUrl}>
        <Download size={16} strokeWidth={2.5} />
        Export
      </button>
    </>
  );
}
