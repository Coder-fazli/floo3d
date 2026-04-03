"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, saveSiteSettings, saveFloorPlanSettings } from "@/lib/actions";

export default function AdminSettings() {
  // Home page SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Floor plan page SEO
  const [fpMetaTitle, setFpMetaTitle] = useState("");
  const [fpMetaDescription, setFpMetaDescription] = useState("");
  const [fpSaving, setFpSaving] = useState(false);
  const [fpSaved, setFpSaved] = useState(false);


  useEffect(() => {
    getSiteSettings().then((s: any) => {
      if (s) {
        setMetaTitle(s.metaTitle ?? "");
        setMetaDescription(s.metaDescription ?? "");
        setFpMetaTitle(s.floorPlanMetaTitle ?? "");
        setFpMetaDescription(s.floorPlanMetaDescription ?? "");
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

  const handleFpSave = async () => {
    try {
      setFpSaving(true);
      await saveFloorPlanSettings(fpMetaTitle, fpMetaDescription);
      setFpSaved(true);
      setTimeout(() => setFpSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setFpSaving(false);
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

      {/* 2D to 3D Floor Plan Converter Page SEO */}
      <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 className="adm-settings-title">2D to 3D Floor Plan Converter Page SEO</h3>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
          Controls what Google shows for <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem" }}>/2d-to-3d-floor-plan-converter</code>
        </p>
        <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1.5rem" }}>
          This page targets keywords like "convert 2D floor plan to 3D model free online" and "2D to 3D floor plan converter".
        </p>

        <div className="adm-form-group">
          <label className="adm-form-label">Meta Title</label>
          <input
            className="adm-form-input"
            type="text"
            value={fpMetaTitle}
            onChange={(e) => setFpMetaTitle(e.target.value)}
            placeholder="2D to 3D Floor Plan Converter — Convert 2D Floor Plan to 3D Model Free Online"
          />
          <p style={{ fontSize: "0.7rem", color: fpMetaTitle.length > 60 ? "#ef4444" : "#94a3b8", marginTop: "0.35rem" }}>
            {fpMetaTitle.length}/60 characters
          </p>
        </div>

        <div className="adm-form-group">
          <label className="adm-form-label">Meta Description</label>
          <textarea
            className="adm-form-input"
            rows={3}
            value={fpMetaDescription}
            onChange={(e) => setFpMetaDescription(e.target.value)}
            placeholder="Convert 2D floor plans to 3D models free online — no credit card, no login required."
            style={{ resize: "vertical" }}
          />
          <p style={{ fontSize: "0.7rem", color: fpMetaDescription.length > 160 ? "#ef4444" : "#94a3b8", marginTop: "0.35rem" }}>
            {fpMetaDescription.length}/160 characters
          </p>
        </div>

        <button className="adm-btn-primary" onClick={handleFpSave} disabled={fpSaving}>
          {fpSaving ? "Saving..." : fpSaved ? "Saved ✓" : "Save Changes"}
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
