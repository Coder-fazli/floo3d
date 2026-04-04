"use client";
import "./models.css";
import { useState } from "react";
import { saveModelSettings } from "@/lib/actions.admin";

const INPUT_TYPES = [
  { key: "floor-plan",           label: "Floor Plan (2D to 3D)" },
  { key: "interior-design",      label: "Interior Design" },
  { key: "outdoor",              label: "Outdoor" },
  { key: "empty-room",           label: "Empty Room" },
  { key: "floor-plan-generator", label: "Floor Plan Generator" },
  { key: "isometric",            label: "Isometric & Cross-Section Views" },
];

const MODELS = [
  { value: "gemini-3-pro-image-preview",     label: "Gemini 3 Pro",     cost: "$0.134/img", badge: "Best quality" },
  { value: "gemini-3.1-flash-image-preview", label: "Gemini 3.1 Flash", cost: "$0.067/img", badge: "Recommended" },
  { value: "gemini-2.5-flash-image",         label: "Gemini 2.5 Flash", cost: "$0.039/img", badge: "Cheapest" },
];

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";

const COSTS: Record<string, number> = {
  "gemini-3-pro-image-preview":     0.134,
  "gemini-3.1-flash-image-preview": 0.067,
  "gemini-2.5-flash-image":         0.039,
};

export default function ModelsAdmin({ initialModels }: { initialModels: Record<string, string> }) {
  const [models, setModels] = useState<Record<string, string>>(initialModels);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveModelSettings(models);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const estimatedAvgCost = () => {
    const values = INPUT_TYPES.map(({ key }) => COSTS[models[key] ?? DEFAULT_MODEL] ?? 0.067);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(3);
  };

  return (
    <div className="adm-content">
      <h1 className="adm-topbar-title" style={{ marginBottom: "0.5rem" }}>AI Models</h1>
      <p className="models-section-title" style={{ marginBottom: "2rem", textTransform: "none", letterSpacing: 0, fontSize: "0.85rem" }}>
        Choose which Gemini model to use per input type. Changes take effect immediately — no redeployment needed.
      </p>

      <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        {INPUT_TYPES.map(({ key, label }) => (
          <div key={key} className="models-row">
            <p className="models-row-label">{label}</p>
            <div className="models-options">
              {MODELS.map(model => {
                const isActive = (models[key] ?? DEFAULT_MODEL) === model.value;
                return (
                  <label
                    key={model.value}
                    className={`models-option${isActive ? " models-option-active" : ""}`}
                  >
                    <input
                      type="radio"
                      name={key}
                      value={model.value}
                      checked={isActive}
                      onChange={() => setModels(m => ({ ...m, [key]: model.value }))}
                    />
                    <span className="models-option-name">{model.label}</span>
                    <span className="models-option-cost">{model.cost}</span>
                    <span className="models-option-badge">{model.badge}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="models-summary">
          <span className="models-summary-label">Estimated avg cost per generation</span>
          <span className="models-summary-value">${estimatedAvgCost()}</span>
        </div>

        <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
