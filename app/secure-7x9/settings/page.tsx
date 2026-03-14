"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, saveSiteSettings } from "@/lib/actions";

export default function AdminSettings() {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteSettings().then((s: any) => {
      if (s) {
        setMetaTitle(s.metaTitle ?? "");
        setMetaDescription(s.metaDescription ?? "");
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveSiteSettings(metaTitle, metaDescription);
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
      <h1 className="adm-topbar-title" style={{ marginBottom: "1.5rem" }}>Settings</h1>

      {/* Home Page SEO */}
      <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 className="adm-settings-title">Home Page SEO</h3>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
          Controls what Google shows in search results for your home page.
        </p>

        <div className="adm-form-group">
          <label className="adm-form-label">Meta Title</label>
          <input
            className="adm-form-input"
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Floo3D – AI 2D to 3D Floor Plan Renderer"
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
            placeholder="Transform any 2D floor plan into a stunning 3D render in seconds."
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

      {/* General */}
      <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 className="adm-settings-title">General App Settings</h3>
        <div className="adm-form-group">
          <label className="adm-form-label">Site Name</label>
          <input className="adm-form-input" type="text" defaultValue="Floo3D" />
        </div>
        <div className="adm-form-group">
          <label className="adm-form-label">Support Email</label>
          <input className="adm-form-input" type="email" defaultValue="support@floo3d.io" />
        </div>
      </div>

    </div>
  );
}
