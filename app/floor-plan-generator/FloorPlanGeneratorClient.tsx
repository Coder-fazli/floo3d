"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Download, Loader2, Sparkles, Plus, Minus } from "lucide-react";
import "./floor-plan-generator.css";

const PROPERTY_TYPES = ["House", "Apartment", "Villa", "Studio", "Office"];

const STYLES = [
  { key: "blueprint", label: "Blueprint", desc: "Black & white architectural" },
  { key: "colored", label: "Colored", desc: "Soft colored rooms" },
  { key: "isometric", label: "Isometric", desc: "3D corner view" },
];

const EXTRAS = [
  { key: "garage", label: "Garage" },
  { key: "balcony", label: "Balcony" },
  { key: "terrace", label: "Terrace" },
  { key: "garden", label: "Garden" },
];

const ROOMS = [
  { key: "bedroom", label: "Bedrooms" },
  { key: "bathroom", label: "Bathrooms" },
  { key: "kitchen", label: "Kitchen" },
  { key: "livingRoom", label: "Living Room" },
  { key: "diningRoom", label: "Dining Room" },
  { key: "office", label: "Office" },
];

type RoomKey = "bedroom" | "bathroom" | "kitchen" | "livingRoom" | "diningRoom" | "office";
type ExtraKey = "garage" | "balcony" | "terrace" | "garden";

export default function FloorPlanGeneratorClient() {
  const { user } = useUser();
  const router = useRouter();

  const [propertyType, setPropertyType] = useState("House");
  const [area, setArea] = useState(100);
  const [areaUnit, setAreaUnit] = useState<"m2" | "sqft">("m2");
  const [floors, setFloors] = useState(1);
  const [rooms, setRooms] = useState<Record<RoomKey, number>>({
    bedroom: 2,
    bathroom: 1,
    kitchen: 1,
    livingRoom: 1,
    diningRoom: 0,
    office: 0,
  });
  const [extras, setExtras] = useState<Record<ExtraKey, boolean>>({
    garage: false,
    balcony: false,
    terrace: false,
    garden: false,
  });
  const [style, setStyle] = useState<"blueprint" | "colored" | "isometric">("blueprint");

  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setRoom(key: RoomKey, delta: number) {
    setRooms((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  }

  function toggleExtra(key: ExtraKey) {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleGenerate() {
    if (!user) { router.push("/sign-in"); return; }
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const res = await fetch("/api/generate-floor-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          config: { propertyType, area, areaUnit, floors, rooms, extras, style },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResultUrl(data.renderedImageUrl);
      setProjectId(data.projectId);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "floor-plan.png";
    a.click();
  }

  return (
    <main className="fpg-page">
      <div className="fpg-container">

        {/* Header */}
        <div className="fpg-header">
          <span className="fpg-eyebrow">AI Floor Plan Generator</span>
          <h1 className="fpg-title">Generate Your Floor Plan</h1>
          <p className="fpg-subtitle">Configure your property and let AI draw the floor plan for you.</p>
        </div>

        <div className="fpg-layout">

          {/* Left — Form */}
          <div className="fpg-form">

            {/* Property Type */}
            <div className="fpg-section">
              <label className="fpg-label">Property Type</label>
              <div className="fpg-chips">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    className={`fpg-chip${propertyType === t ? " fpg-chip-active" : ""}`}
                    onClick={() => setPropertyType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Area + Floors */}
            <div className="fpg-section">
              <div className="fpg-row">
                <div className="fpg-field">
                  <label className="fpg-label">Area</label>
                  <div className="fpg-input-row">
                    <input
                      type="number"
                      className="fpg-input"
                      value={area}
                      min={20}
                      max={2000}
                      onChange={(e) => setArea(Number(e.target.value))}
                    />
                    <div className="fpg-unit-toggle">
                      <button
                        className={`fpg-unit-btn${areaUnit === "m2" ? " active" : ""}`}
                        onClick={() => setAreaUnit("m2")}
                      >m²</button>
                      <button
                        className={`fpg-unit-btn${areaUnit === "sqft" ? " active" : ""}`}
                        onClick={() => setAreaUnit("sqft")}
                      >sqft</button>
                    </div>
                  </div>
                </div>

                <div className="fpg-field">
                  <label className="fpg-label">Floors</label>
                  <div className="fpg-stepper">
                    <button className="fpg-step-btn" onClick={() => setFloors((f) => Math.max(1, f - 1))}><Minus size={14} /></button>
                    <span className="fpg-step-val">{floors}</span>
                    <button className="fpg-step-btn" onClick={() => setFloors((f) => Math.min(5, f + 1))}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="fpg-section">
              <label className="fpg-label">Rooms</label>
              <div className="fpg-rooms">
                {ROOMS.map(({ key, label }) => (
                  <div key={key} className="fpg-room-row">
                    <span className="fpg-room-label">{label}</span>
                    <div className="fpg-stepper">
                      <button className="fpg-step-btn" onClick={() => setRoom(key as RoomKey, -1)}><Minus size={14} /></button>
                      <span className="fpg-step-val">{rooms[key as RoomKey]}</span>
                      <button className="fpg-step-btn" onClick={() => setRoom(key as RoomKey, 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div className="fpg-section">
              <label className="fpg-label">Extras</label>
              <div className="fpg-chips">
                {EXTRAS.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`fpg-chip${extras[key as ExtraKey] ? " fpg-chip-active" : ""}`}
                    onClick={() => toggleExtra(key as ExtraKey)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="fpg-section">
              <label className="fpg-label">Style</label>
              <div className="fpg-styles">
                {STYLES.map((s) => (
                  <button
                    key={s.key}
                    className={`fpg-style-card${style === s.key ? " fpg-style-active" : ""}`}
                    onClick={() => setStyle(s.key as any)}
                  >
                    <span className="fpg-style-name">{s.label}</span>
                    <span className="fpg-style-desc">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button className="fpg-generate-btn" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="fpg-spin" /> Generating...</>
              ) : (
                <><Sparkles size={18} /> Generate Floor Plan</>
              )}
            </button>

            {error && <p className="fpg-error">{error}</p>}
          </div>

          {/* Right — Result */}
          <div className="fpg-result">
            {resultUrl ? (
              <>
                <img src={resultUrl} alt="Generated floor plan" className="fpg-result-img" />
                <div className="fpg-result-actions">
                  <button className="fpg-dl-btn" onClick={handleDownload}>
                    <Download size={16} /> Download
                  </button>
                  {projectId && (
                    <button className="fpg-3d-btn" onClick={() => router.push(`/visualizer/${projectId}`)}>
                      <Sparkles size={16} /> Convert to 3D
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="fpg-placeholder">
                {loading ? (
                  <>
                    <Loader2 size={40} className="fpg-spin fpg-placeholder-icon" />
                    <p>Generating your floor plan...</p>
                  </>
                ) : (
                  <>
                    <div className="fpg-placeholder-icon-wrap">
                      <Sparkles size={40} />
                    </div>
                    <p>Your floor plan will appear here</p>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
