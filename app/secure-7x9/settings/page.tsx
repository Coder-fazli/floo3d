"use client";

import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/actions";
import { saveSiteSettings, saveFloorPlanSettings, saveGeneralSettings, saveLogoImage, backfillSubscriptionOrders } from "@/lib/actions.admin";

function cropToSquare(dataUrl: string, size = 256): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        img,
        (img.width - s) / 2,
        (img.height - s) / 2,
        s, s,
        0, 0,
        size, size
      );
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = dataUrl;
  });
}

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

  // General settings
  const [siteName, setSiteName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalSaved, setGeneralSaved] = useState(false);

  // Branding
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  // Backfill
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<{ created: number; skipped: number } | null>(null);


  useEffect(() => {
    getSiteSettings().then((s: any) => {
      if (s) {
        setMetaTitle(s.metaTitle ?? "");
        setMetaDescription(s.metaDescription ?? "");
        setFpMetaTitle(s.floorPlanMetaTitle ?? "");
        setFpMetaDescription(s.floorPlanMetaDescription ?? "");
        setSiteName(s.siteName ?? "");
        setSupportEmail(s.supportEmail ?? "");
        setLogoUrl(s.logoUrl ?? null);
        setFaviconUrl(s.faviconUrl ?? null);
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
          <input className="adm-form-input" type="text" value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="MyHomeStyler" />
        </div>
        <div className="adm-form-group">
          <label className="adm-form-label">Support Email</label>
          <input className="adm-form-input" type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="support@myhomestyler.com" />
        </div>
        <button className="adm-btn-primary" disabled={generalSaving} onClick={async () => {
          setGeneralSaving(true);
          await saveGeneralSettings(siteName, supportEmail);
          setGeneralSaved(true);
          setTimeout(() => setGeneralSaved(false), 2500);
          setGeneralSaving(false);
        }}>
          {generalSaving ? "Saving..." : generalSaved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      {/* Branding */}
      <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 className="adm-settings-title">Branding</h3>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem" }}>Upload your logo and favicon. Recommended: PNG with transparent background.</p>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Logo */}
          <div>
            <label className="adm-form-label">Logo</label>
            <div style={{ width: 160, height: 60, border: "2px dashed #e2e8f0", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#f8fafc", cursor: "pointer", position: "relative" }}
              onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = async (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; setLogoUploading(true); const r = new FileReader(); r.onload = async () => { const url = await saveLogoImage(r.result as string, "logo"); setLogoUrl(url); setLogoUploading(false); }; r.readAsDataURL(f); }; i.click(); }}>
              {logoUploading ? <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Uploading…</span>
                : logoUrl ? <img src={logoUrl} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                : <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Click to upload</span>}
            </div>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.35rem" }}>Recommended: 320×80px PNG</p>
          </div>

          {/* Favicon */}
          <div>
            <label className="adm-form-label">Favicon</label>
            <div style={{ width: 60, height: 60, border: "2px dashed #e2e8f0", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#f8fafc", cursor: "pointer" }}
              onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = async (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; setFaviconUploading(true); const r = new FileReader(); r.onload = async () => { const cropped = await cropToSquare(r.result as string, 256); const url = await saveLogoImage(cropped, "favicon"); setFaviconUrl(url); setFaviconUploading(false); }; r.readAsDataURL(f); }; i.click(); }}>
              {faviconUploading ? <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>…</span>
                : faviconUrl ? <img src={faviconUrl} alt="Favicon" style={{ width: 40, height: 40, objectFit: "contain" }} />
                : <span style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center" }}>Click</span>}
            </div>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.35rem" }}>Recommended: 32×32px ICO/PNG</p>
          </div>
        </div>
      </div>

      {/* Backfill historical subscription revenue */}
      <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h3 className="adm-settings-title">Backfill Subscription Revenue</h3>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
          Creates missing Order records for all past Stripe subscription payments so they appear in analytics.
          Safe to run multiple times — existing records are never duplicated.
        </p>
        <button
          className="adm-btn-primary"
          disabled={backfilling}
          onClick={async () => {
            setBackfilling(true);
            setBackfillResult(null);
            const result = await backfillSubscriptionOrders();
            setBackfillResult(result);
            setBackfilling(false);
          }}
        >
          {backfilling ? "Running…" : "Run Backfill"}
        </button>
        {backfillResult && (
          <p style={{ fontSize: "0.8rem", color: "#22c55e", marginTop: "0.75rem" }}>
            Done — {backfillResult.created} new records created, {backfillResult.skipped} already existed or skipped.
          </p>
        )}
      </div>

    </div>
  );
}
