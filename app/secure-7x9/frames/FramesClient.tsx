"use client";

import { useRef, useState } from "react";
import { saveFrameImage, type FramesData } from "@/lib/actions";
import { DEFAULT_FALLBACKS, DEFAULT_STYLES, INPUT_TYPE_LABELS } from "@/lib/frameDefaults";
import { Upload } from "lucide-react";

type Props = { initialFrames: FramesData };

function toBase64(file: File): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.readAsDataURL(file);
  });
}

// Reusable slot — handles its own hidden file input
function ImageSlot({
  src, label, uploading, square, onPick,
}: {
  src: string; label?: string; uploading: boolean; square?: boolean; onPick: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{ flex: square ? "unset" : 1, minWidth: 0, width: square ? "100%" : undefined }}>
      {label && (
        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
          {label}
        </p>
      )}
      <div
        onClick={() => !uploading && ref.current?.click()}
        style={{
          position: "relative",
          aspectRatio: square ? "1" : "4/3",
          borderRadius: "0.5rem",
          overflow: "hidden",
          border: "2px dashed #e2e8f0",
          cursor: uploading ? "wait" : "pointer",
          background: "#f8fafc",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ec5b13"; const ov = e.currentTarget.querySelector<HTMLElement>(".frame-ov"); if (ov) ov.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; const ov = e.currentTarget.querySelector<HTMLElement>(".frame-ov"); if (ov && !uploading) ov.style.opacity = "0"; }}
      >
        <img src={src} alt={label ?? "frame"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div className="frame-ov" style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "0.3rem", opacity: uploading ? 1 : 0, transition: "opacity 0.2s", pointerEvents: "none",
        }}>
          {uploading
            ? <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 600 }}>Uploading…</span>
            : <><Upload size={square ? 14 : 18} color="#fff" /><span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 600 }}>Replace</span></>
          }
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }}
        />
      </div>
    </div>
  );
}

export default function FramesClient({ initialFrames }: Props) {
  const [frames, setFrames] = useState<FramesData>(initialFrames);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const setUpl = (key: string, val: boolean) => setUploading((u) => ({ ...u, [key]: val }));

  const handleFallback = async (type: string, slot: "before" | "after", file: File) => {
    const uk = `f:${type}:${slot}`;
    setUpl(uk, true);
    try {
      const url = await saveFrameImage("fallback", type, slot, await toBase64(file));
      setFrames((f) => ({ ...f, fallbacks: { ...f.fallbacks, [type]: { ...f.fallbacks[type], [slot]: url } } }));
    } finally { setUpl(uk, false); }
  };

  const handleStyle = async (inputType: string, style: string, file: File) => {
    const uk = `s:${inputType}:${style}`;
    setUpl(uk, true);
    try {
      const url = await saveFrameImage("style", inputType, style, await toBase64(file));
      setFrames((f) => ({
        ...f,
        styles: { ...f.styles, [inputType]: { ...(f.styles[inputType] ?? {}), [style]: url } },
      }));
    } finally { setUpl(uk, false); }
  };

  return (
    <div className="adm-content">
      <h1 className="adm-topbar-title" style={{ marginBottom: "0.375rem" }}>Frames</h1>
      <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "2rem" }}>
        Manage default visualizer images. Click any image to replace it — uploads instantly to Cloudinary.
      </p>

      {/* Input Type Covers */}
      <div className="adm-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
        <h3 className="adm-settings-title" style={{ marginBottom: "0.375rem" }}>Input Type Covers</h3>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
          Before / After comparison images shown when no project has been uploaded yet.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {Object.keys(DEFAULT_FALLBACKS).map((type) => {
            const def = DEFAULT_FALLBACKS[type];
            const saved = frames.fallbacks[type] ?? {};
            return (
              <div key={type} style={{ border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "1rem" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.875rem" }}>
                  {INPUT_TYPE_LABELS[type]}
                </p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <ImageSlot src={saved.before ?? def.before} label="Before" uploading={!!uploading[`f:${type}:before`]} onPick={(f) => handleFallback(type, "before", f)} />
                  <ImageSlot src={saved.after  ?? def.after}  label="After"  uploading={!!uploading[`f:${type}:after`]}  onPick={(f) => handleFallback(type, "after",  f)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Style Thumbnails — grouped by input type */}
      {Object.entries(DEFAULT_STYLES).map(([inputType, styleMap]) => (
        <div key={inputType} className="adm-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 className="adm-settings-title" style={{ marginBottom: "0.375rem" }}>
            {INPUT_TYPE_LABELS[inputType]} — Style Thumbnails
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
            Preview images shown in the sidebar style picker for {INPUT_TYPE_LABELS[inputType].toLowerCase()} projects.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem" }}>
            {Object.keys(styleMap).map((style) => (
              <div key={style}>
                <ImageSlot
                  src={frames.styles[inputType]?.[style] ?? styleMap[style]}
                  uploading={!!uploading[`s:${inputType}:${style}`]}
                  square
                  onPick={(f) => handleStyle(inputType, style, f)}
                />
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", textAlign: "center", marginTop: "0.375rem" }}>{style}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
