"use client";

import { useState, useEffect } from "react";
import { Send, Users, Clock } from "lucide-react";

const AUDIENCES = [
  { value: "all",      label: "All Users",         desc: "Everyone with an email" },
  { value: "free",     label: "Free Users",         desc: "Never purchased a plan" },
  { value: "inactive", label: "Inactive 7+ days",   desc: "Haven't used the app recently" },
  { value: "new",      label: "Never Generated",    desc: "Signed up but never used credits" },
  { value: "paid",     label: "Paid Users",         desc: "Active subscribers" },
  { value: "specific", label: "Specific User",      desc: "Search and pick one person" },
];

const TEMPLATES = [
  {
    id: "never-generated",
    label: "Never Generated",
    audience: "new",
    subject: "You have 2 free credits waiting 🏠",
    body: `Your account is ready but your free credits are sitting unused.

Upload any room photo or floor plan and see what AI can do in 10 seconds.

No design skills needed. Most users are amazed on their first try.`,
    ctaText: "Use My Free Credits",
    ctaUrl: "https://myhomestyler.com/dashboard",
  },
  {
    id: "upgrade-nudge",
    label: "Upgrade Nudge",
    audience: "free",
    subject: "Your renders were just the beginning ✨",
    body: `You've seen what MyHomeStyler can do. Your free renders looked great — imagine having 300 credits to redesign every room in your home or show clients unlimited options.

Pro plan is $24.99/month. That's less than one coffee per week for unlimited professional renders.`,
    ctaText: "Upgrade to Pro",
    ctaUrl: "https://myhomestyler.com/pricing",
  },
  {
    id: "win-back",
    label: "Win Back Inactive",
    audience: "inactive",
    subject: "A lot has changed since your last visit 👀",
    body: `We've added isometric 3D views, outdoor garden design, and virtual staging since you last visited.

Come back and try something new — your credits are still waiting.`,
    ctaText: "See What's New",
    ctaUrl: "https://myhomestyler.com/dashboard",
  },
];

export default function CampaignsPage() {
  const [audience, setAudience] = useState("free");
  const [subject, setSubject]   = useState("");
  const [body, setBody]         = useState("");
  const [ctaText, setCtaText]   = useState("");
  const [ctaUrl, setCtaUrl]     = useState("https://myhomestyler.com/dashboard");
  const [logoUrl, setLogoUrl]   = useState("");
  const [btnColor, setBtnColor] = useState("#fb3b01");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<{ sent: number; message?: string } | null>(null);
  const [error, setError]   = useState<string | null>(null);

// For seach funciton

  const [specificUser, setSpecificUser] = useState<{
  clerkId: string; name: string; email: string } |
  null>(null);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] =
  useState<any[]>([]);
  const [searching, setSearching]       = useState(false);
  const [preview, setPreview]           = useState<number | null>(null);
  const [previewing, setPreviewing]     = useState(false);
  const [history, setHistory]           = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/campaign-history")
      .then(r => r.json())
      .then(d => setHistory(d.logs ?? []));
  }, [result]);

  // Handle seach of user
    const handleSearch = async (q: string) => {
        setSearchQuery(q);
        setSpecificUser(null);
        if (q.length < 2) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const res = await fetch(`/api/admin/search-users?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setSearchResults(data.users ?? []);
            setSearching(false);
        } catch (error) {
            setSearchResults([]);
            setSearching(false);
        }
    }


  const handlePreview = async () => {
    setPreviewing(true);
    setPreview(null);
    const res = await fetch("/api/admin/campaign-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, specificUserId: specificUser?.clerkId ?? null }),
    });
    const data = await res.json();
    setPreview(data.count ?? 0);
    setPreviewing(false);
  };

    // Handle sending compaigns
  const handleSend = async () => {
    if (!subject || !body) return alert("Subject and body are required");
    const chosen = AUDIENCES.find(a => a.value === audience);
    if (!confirm(`Send to: ${chosen?.label}?\n\nSubject: ${subject}`)) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, subject, body, ctaText, ctaUrl, specificUserId: specificUser?.clerkId ?? null, logoUrl, btnColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to send campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-content">
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 className="adm-topbar-title">Email Campaigns</h1>
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>
          Send targeted emails to your users via Resend
        </p>
      </div>

      {/* ── Templates ── */}
      <div className="adm-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>Quick Templates</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {TEMPLATES.map(t => (
            <div key={t.id} style={{ padding: "1rem", border: "1px solid #e8e4df", borderRadius: "0.75rem", background: "#fafafa" }}>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.82rem", fontWeight: 700, color: "#27282f" }}>{t.label}</p>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.4 }}>{t.subject}</p>
              <button
                className="adm-btn-primary"
                style={{ fontSize: "0.65rem", padding: "0.35rem 0.75rem" }}
                onClick={() => { setSubject(t.subject); setBody(t.body); setCtaText(t.ctaText); setCtaUrl(t.ctaUrl); setAudience(t.audience); }}
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Email Branding Settings ── */}
      <div className="adm-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>Email Branding</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
          <div>
            <label className="adm-form-label">Logo URL (optional)</label>
            <input className="adm-form-input" type="text" placeholder="https://... leave empty to use text logo" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
          </div>
          <div>
            <label className="adm-form-label">Button URL</label>
            <input className="adm-form-input" type="text" value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} />
          </div>
          <div>
            <label className="adm-form-label">Button Color</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="color" value={btnColor} onChange={e => setBtnColor(e.target.value)} style={{ width: "2.5rem", height: "2.5rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", cursor: "pointer", padding: "2px" }} />
              <input className="adm-form-input" type="text" value={btnColor} onChange={e => setBtnColor(e.target.value)} style={{ width: "100px" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* ── Left: Form ── */}
        <div className="adm-card" style={{ padding: "2rem" }}>

          {/* Audience */}
          <div className="adm-form-group">
            <label className="adm-form-label">Audience</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {AUDIENCES.map(a => (
                <label
                  key={a.value}
                  onClick={() => setAudience(a.value)}
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.875rem", borderRadius: "0.75rem", border: `1.5px solid ${audience === a.value ? "var(--brand-color)" : "#e8e4df"}`, background: audience === a.value ? "rgba(236,91,19,0.04)" : "#fafafa", cursor: "pointer", transition: "all 0.15s" }}
                >
                  <span style={{ width: "16px", height: "16px", borderRadius: "9999px", border: `2px solid ${audience === a.value ? "var(--brand-color)" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {audience === a.value && <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "var(--brand-color)" }} />}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#27282f" }}>{a.label}</p>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{a.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Specific user search */}
          {audience === "specific" && (
            <div className="adm-form-group">
              <label className="adm-form-label">Search User</label>
              <input
                className="adm-form-input"
                type="text"
                placeholder="Type name or email..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
              />
              {searching && <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>Searching...</p>}

              {searchResults.length > 0 && !specificUser && (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.75rem", marginTop: "0.5rem", overflow: "hidden", background: "#fff" }}>
                  {searchResults.map((u: any) => (
                    <div
                      key={u.clerkId}
                      onClick={() => { setSpecificUser(u); setSearchResults([]); setSearchQuery(u.name || u.email); }}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1rem", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                    >
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--brand-color)", flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#27282f" }}>{u.name || "No name"}</p>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {specificUser && (
                <div style={{ marginTop: "0.5rem", padding: "0.65rem 1rem", background: "rgba(236,91,19,0.06)", border: "1.5px solid var(--brand-color)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#27282f" }}>{specificUser.name}</p>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{specificUser.email}</p>
                  </div>
                  <button onClick={() => { setSpecificUser(null); setSearchQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1rem" }}>✕</button>
                </div>
              )}
            </div>
          )}

          {/* Subject */}
          <div className="adm-form-group">
            <label className="adm-form-label">Subject Line</label>
            <input
              className="adm-form-input"
              type="text"
              placeholder="e.g. Your 2 free credits are waiting 🏠"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="adm-form-group">
            <label className="adm-form-label">Email Body</label>
            <textarea
              className="adm-form-input"
              rows={6}
              placeholder="Write your message here..."
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* CTA */}
          <div className="adm-form-grid" style={{ marginBottom: "1.25rem" }}>
            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Button Text (optional)</label>
              <input
                className="adm-form-input"
                type="text"
                placeholder="Try It Free"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
              />
            </div>
            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Button URL (optional)</label>
              <input
                className="adm-form-input"
                type="text"
                value={ctaUrl}
                onChange={e => setCtaUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Preview + Send buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0" }}>
            <button
              className="adm-btn-ghost"
              onClick={handlePreview}
              disabled={previewing}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <Users size={14} />
              {previewing ? "Checking…" : "Preview Audience"}
            </button>
            <button
              className="adm-btn-primary"
              onClick={handleSend}
              disabled={loading || !subject || !body}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <Send size={14} />
              {loading ? "Sending…" : "Send Campaign"}
            </button>
          </div>

          {preview !== null && (
            <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: preview > 0 ? "rgba(236,91,19,0.06)" : "#f8fafc", border: `1px solid ${preview > 0 ? "var(--brand-color)" : "#e2e8f0"}`, borderRadius: "0.75rem", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: preview > 0 ? "var(--brand-color)" : "#94a3b8" }}>
                {preview > 0 ? `${preview} users will receive this email` : "No users match this audience"}
              </p>
            </div>
          )}

          {result && (
            <p style={{ margin: "1rem 0 0", fontSize: "0.82rem", color: "#16a34a", fontWeight: 600, textAlign: "center" }}>
              ✓ Sent to {result.sent} users{result.message ? ` — ${result.message}` : ""}
            </p>
          )}
          {error && (
            <p style={{ margin: "1rem 0 0", fontSize: "0.82rem", color: "#ef4444", textAlign: "center" }}>{error}</p>
          )}
        </div>

        {/* ── Right: Preview ── */}
        <div className="adm-card" style={{ padding: "2rem" }}>
          <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
            Email Preview
          </p>

          <div style={{ background: "#faf7f4", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e8e4df" }}>
            {logoUrl
              ? <img src={logoUrl} alt="logo" style={{ height: "36px", objectFit: "contain", marginBottom: "12px", display: "block" }} />
              : <p style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "#27282f" }}>MyHome<span style={{ color: btnColor }}>Styler</span></p>
            }
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.82rem", color: "#475569" }}>Hi [Name],</p>
            <p style={{ margin: "0 0 1rem", fontSize: "0.82rem", color: body ? "#475569" : "#cbd5e1", whiteSpace: "pre-wrap", minHeight: "60px" }}>
              {body || "Your message will appear here..."}
            </p>
            {ctaText && (
              <div style={{ display: "inline-block", background: btnColor, color: "#fff", padding: "8px 20px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                {ctaText}
              </div>
            )}
            <p style={{ margin: "1rem 0 0", fontSize: "11px", color: "#94a3b8" }}>
              You're receiving this because you signed up at myhomestyler.com.
            </p>
          </div>

          <div style={{ marginTop: "1.25rem", padding: "1rem", background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 0.4rem", fontSize: "0.72rem", fontWeight: 700, color: "#475569" }}>Subject line preview:</p>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: subject ? "#27282f" : "#cbd5e1" }}>
              {subject || "Your subject line..."}
            </p>
          </div>
        </div>

      </div>

      {/* ── Campaign History ── */}
      <div className="adm-card" style={{ marginTop: "1.5rem", overflow: "hidden" }}>
        <div className="adm-table-head">
          <h4 className="adm-table-title" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Clock size={14} /> Campaign History
          </h4>
        </div>
        {history.length === 0 ? (
          <p style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.82rem" }}>No campaigns sent yet</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Audience</th>
                  <th>Subject</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {history.map((log: any) => (
                  <tr key={log._id}>
                    <td style={{ color: "#94a3b8", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                      {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "999px", background: "#f1f5f9", color: "#475569", textTransform: "capitalize" }}>
                        {log.audience}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#27282f", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.subject}</td>
                    <td style={{ fontWeight: 700, color: "var(--brand-color)" }}>{log.sent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
