"use client";

import { useEffect, useRef, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage } from "react-compare-slider";
import { getSiteSettings } from "@/lib/actions";
import { saveFloorPlanGeneratorSettings, saveFpgImage } from "@/lib/actions.admin";
import { Upload, CheckCircle2 } from "lucide-react";

// ── Fallbacks ──
const HERO_FALLBACK = { before: "/real-2d-plan.jpg", after: "/real-3d-render.jpg" };

function toBase64(file: File): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.readAsDataURL(file);
  });
}

function UploadBtn({ uploading, saved, side, onPick }: {
  uploading: boolean;
  saved: boolean;
  side: "before" | "after";
  onPick: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
        {side}
      </p>
      <button
        type="button"
        onClick={() => !uploading && ref.current?.click()}
        style={{
          width: "100%",
          padding: "0.6rem 1rem",
          border: "2px dashed",
          borderColor: saved ? "#16a34a" : uploading ? "var(--brand-color)" : "#e2e8f0",
          borderRadius: "0.625rem",
          background: saved ? "#f0fdf4" : uploading ? "rgba(236,91,19,0.04)" : "#f8fafc",
          color: saved ? "#16a34a" : uploading ? "var(--brand-color)" : "#64748b",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: uploading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          fontFamily: "inherit",
          transition: "all 0.2s",
        }}
      >
        {saved ? <CheckCircle2 size={14} /> : <Upload size={14} />}
        {uploading ? "Uploading…" : saved ? "Saved!" : `Upload ${side} image`}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }}
      />
    </div>
  );
}

function SliderSection({
  label,
  beforeUrl,
  afterUrl,
  onUpload,
}: {
  label: string;
  beforeUrl: string;
  afterUrl: string;
  onUpload: (side: "before" | "after", file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState<"before" | "after" | null>(null);
  const [saved, setSaved] = useState<"before" | "after" | null>(null);

  async function handle(side: "before" | "after", file: File) {
    setUploading(side);
    setSaved(null);
    try {
      await onUpload(side, file);
      setSaved(side);
      setTimeout(() => setSaved(null), 2500);
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="adm-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem" }}>{label}</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
            Preview
          </p>
          <div style={{ borderRadius: "0.75rem", overflow: "hidden", aspectRatio: "4/3", border: "1px solid #e2e8f0" }}>
            <ReactCompareSlider
              defaultValue={50}
              style={{ width: "100%", height: "100%" }}
              handle={
                <ReactCompareSliderHandle
                  buttonStyle={{ background: "#fff", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,0.2)", color: "var(--brand-color)", width: "2.5rem", height: "2.5rem" }}
                  linesStyle={{ background: "rgba(236,91,19,0.6)", width: 2 }}
                />
              }
              itemOne={<ReactCompareSliderImage src={beforeUrl} alt="Before" style={{ objectFit: "cover" }} />}
              itemTwo={<ReactCompareSliderImage src={afterUrl}  alt="After"  style={{ objectFit: "cover" }} />}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.5rem" }}>
          <UploadBtn side="before" uploading={uploading === "before"} saved={saved === "before"} onPick={(f) => handle("before", f)} />
          <UploadBtn side="after"  uploading={uploading === "after"}  saved={saved === "after"}  onPick={(f) => handle("after", f)} />
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: 0, fontStyle: "italic" }}>
            Changes go live on the floor plan generator page immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FloorPlanGeneratorAdmin({
  heroBeforeUrl,
  heroAfterUrl,
}: {
  heroBeforeUrl: string | null;
  heroAfterUrl: string | null;
}) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [heroUrls, setHeroUrls] = useState({
    before: heroBeforeUrl ?? HERO_FALLBACK.before,
    after:  heroAfterUrl  ?? HERO_FALLBACK.after,
  });

  useEffect(() => {
    getSiteSettings().then((s: any) => {
      if (s) {
        setMetaTitle(s.floorPlanGeneratorMetaTitle ?? "");
        setMetaDescription(s.floorPlanGeneratorMetaDescription ?? "");
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveFloorPlanGeneratorSettings(metaTitle, metaDescription);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  async function handleHeroUpload(side: "before" | "after", file: File) {
    const base64 = await toBase64(file);
    const url = await saveFpgImage(`hero-${side}`, base64);
    setHeroUrls((prev) => ({ ...prev, [side]: url }));
  }

  return (
    <div className="adm-content">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="adm-topbar-title" style={{ marginBottom: "0.25rem" }}>Floor Plan Generator Page</h1>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
          Manage images and SEO for <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem" }}>/floor-plan-generator</code>
        </p>
      </div>

      {/* Hero slider images */}
      <h3 style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 1rem" }}>
        Hero Section
      </h3>
      <SliderSection
        label="Hero Slider"
        beforeUrl={heroUrls.before}
        afterUrl={heroUrls.after}
        onUpload={handleHeroUpload}
      />

      {/* SEO */}
      <h3 style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", margin: "2rem 0 1rem" }}>
        SEO
      </h3>
      <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 className="adm-settings-title">Meta Title & Description</h3>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
          Controls what Google shows in search results for the floor plan generator page.
        </p>
        <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1.5rem" }}>
          Target keywords: "ai floor plan generator", "ai floor plan generator free", "ai blueprint generator".
        </p>

        <div className="adm-form-group">
          <label className="adm-form-label">Meta Title</label>
          <input
            className="adm-form-input"
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="AI Floor Plan Generator — Create Custom Floor Plans Free Online"
          />
          <p style={{ fontSize: "0.7rem", color: metaTitle.length > 60 ? "#ef4444" : "#94a3b8", marginTop: "0.35rem" }}>
            {metaTitle.length}/60 characters
          </p>
        </div>

        <div className="adm-form-group">
          <label className="adm-form-label">Meta Description</label>
          <textarea
            className="adm-form-input"
            rows={3}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Generate a custom 2D floor plan from scratch using AI. Choose your rooms, size, and style — get a professional floor plan in seconds. Free to start."
            style={{ resize: "vertical" }}
          />
          <p style={{ fontSize: "0.7rem", color: metaDescription.length > 160 ? "#ef4444" : "#94a3b8", marginTop: "0.35rem" }}>
            {metaDescription.length}/160 characters
          </p>
        </div>

        <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
