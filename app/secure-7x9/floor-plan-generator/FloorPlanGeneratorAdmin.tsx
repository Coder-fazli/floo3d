"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, saveFloorPlanGeneratorSettings } from "@/lib/actions";

export default function FloorPlanGeneratorAdmin() {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="adm-content">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="adm-topbar-title" style={{ marginBottom: "0.25rem" }}>Floor Plan Generator Page</h1>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
          Manage SEO settings for <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem" }}>/floor-plan-generator</code>
        </p>
      </div>

      {/* SEO */}
      <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 className="adm-settings-title">SEO — Meta Title & Description</h3>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
          Controls what Google shows in search results for the floor plan generator page.
        </p>
        <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1.5rem" }}>
          Target keywords: "ai floor plan generator", "ai floor plan generator free", "ai blueprint generator", "create floor plan online free".
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
