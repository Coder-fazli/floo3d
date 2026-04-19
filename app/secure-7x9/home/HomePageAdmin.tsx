"use client";

import { useRef, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage } from "react-compare-slider";
import { saveHomeImage, type HomeImages } from "@/lib/actions.admin";
import { Upload, CheckCircle2 } from "lucide-react";

// ── Fallback static images (used when no DB image set yet) ──
const FALLBACKS: Record<string, { before: string; after: string; label: string }> = {
  hero:  { before: "/hero-before.jpg",          after: "/hero-after.jpg",          label: "Hero Slider" },
  "01":  { before: "/real-2d-plan.jpg",          after: "/real-3d-render.jpg",       label: "01 · 2D Floor Plan to 3D" },
  "02":  { before: "/fp-before-1.png",           after: "/fp-after-1.jpg",           label: "02 · Room Style Transfer" },
  "03":  { before: "/fp-before-2.png",           after: "/fp-after-2.jpg",           label: "03 · Empty the Room" },
  "04":  { before: "/card-outdoor-before.avif",  after: "/card-outdoor-after.avif",  label: "04 · Outdoor / Garden" },
};

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
  sectionKey,
  label,
  beforeUrl,
  afterUrl,
  onSave,
}: {
  sectionKey: string;
  label: string;
  beforeUrl: string;
  afterUrl: string;
  onSave: (key: string, side: "before" | "after", url: string) => void;
}) {
  const [uploading, setUploading] = useState<"before" | "after" | null>(null);
  const [saved, setSaved] = useState<"before" | "after" | null>(null);

  async function handleUpload(side: "before" | "after", file: File) {
    setUploading(side);
    setSaved(null);
    try {
      const base64 = await toBase64(file);
      const slot = sectionKey === "hero"
        ? (`hero-${side}` as any)
        : (`transform-${sectionKey}-${side}` as any);
      const url = await saveHomeImage(slot, base64);
      onSave(sectionKey, side, url);
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
        {/* Slider preview */}
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
                  buttonStyle={{
                    background: "#fff",
                    border: "none",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
                    color: "var(--brand-color)",
                    width: "2.5rem",
                    height: "2.5rem",
                  }}
                  linesStyle={{ background: "rgba(236,91,19,0.6)", width: 2 }}
                />
              }
              itemOne={<ReactCompareSliderImage src={beforeUrl} alt="Before" style={{ objectFit: "cover" }} />}
              itemTwo={<ReactCompareSliderImage src={afterUrl}  alt="After"  style={{ objectFit: "cover" }} />}
            />
          </div>
        </div>

        {/* Upload buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.5rem" }}>
          <UploadBtn
            side="before"
            uploading={uploading === "before"}
            saved={saved === "before"}
            onPick={(f) => handleUpload("before", f)}
          />
          <UploadBtn
            side="after"
            uploading={uploading === "after"}
            saved={saved === "after"}
            onPick={(f) => handleUpload("after", f)}
          />
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: 0, fontStyle: "italic" }}>
            Click an image slot to replace it. Changes go live on the home page immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePageAdmin({ images }: { images: HomeImages }) {
  const [urls, setUrls] = useState({
    hero:  { before: images.heroBeforeUrl  ?? FALLBACKS.hero["before"],  after: images.heroAfterUrl  ?? FALLBACKS.hero["after"] },
    "01":  { before: images.transformImages["01"]?.before ?? FALLBACKS["01"].before, after: images.transformImages["01"]?.after ?? FALLBACKS["01"].after },
    "02":  { before: images.transformImages["02"]?.before ?? FALLBACKS["02"].before, after: images.transformImages["02"]?.after ?? FALLBACKS["02"].after },
    "03":  { before: images.transformImages["03"]?.before ?? FALLBACKS["03"].before, after: images.transformImages["03"]?.after ?? FALLBACKS["03"].after },
    "04":  { before: images.transformImages["04"]?.before ?? FALLBACKS["04"].before, after: images.transformImages["04"]?.after ?? FALLBACKS["04"].after },
  } as Record<string, { before: string; after: string }>);

  function handleSave(key: string, side: "before" | "after", url: string) {
    setUrls((prev) => ({ ...prev, [key]: { ...prev[key], [side]: url } }));
  }

  return (
    <div className="adm-content">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="adm-topbar-title" style={{ marginBottom: "0.25rem" }}>Home Page Images</h1>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
          Manage before/after images for the hero slider and the LIMITLESS TRANSFORMATIONS section.
        </p>
      </div>

      <h3 style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 1rem" }}>
        Hero Section
      </h3>
      <SliderSection
        sectionKey="hero"
        label={FALLBACKS.hero.label}
        beforeUrl={urls.hero.before}
        afterUrl={urls.hero.after}
        onSave={handleSave}
      />

      <h3 style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", margin: "2rem 0 1rem" }}>
        Limitless Transformations
      </h3>
      {(["01", "02", "03", "04"] as const).map((key) => (
        <SliderSection
          key={key}
          sectionKey={key}
          label={FALLBACKS[key].label}
          beforeUrl={urls[key].before}
          afterUrl={urls[key].after}
          onSave={handleSave}
        />
      ))}
    </div>
  );
}
