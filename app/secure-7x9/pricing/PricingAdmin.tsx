"use client";

import { useState } from "react";
import { savePricingSettings } from "@/lib/actions.admin";
import { Zap, Shield, CheckCircle2 } from "lucide-react";

type Settings = {
  starterPrice: number; starterCredits: number; starterDescription: string; starterFeatures: string[];
  proPrice: number; proCredits: number; proDescription: string; proFeatures: string[];
};

function PlanEditor({
  title, icon, color,
  price, credits, description, features,
  onChange,
}: {
  title: string; icon: React.ReactNode; color: string;
  price: number; credits: number; description: string; features: string[];
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="adm-card" style={{ padding: "1.75rem", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
        <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{title} Plan</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label className="adm-form-label">Price ($)</label>
          <input
            className="adm-credits-adjust-input"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={e => onChange("price", parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label className="adm-form-label">Credits</label>
          <input
            className="adm-credits-adjust-input"
            type="number"
            value={credits}
            onChange={e => onChange("credits", Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label className="adm-form-label">Description</label>
        <textarea
          value={description}
          onChange={e => onChange("description", e.target.value)}
          rows={2}
          style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.82rem", color: "#0f172a", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      <div>
        <label className="adm-form-label">Features <span style={{ color: "#94a3b8", fontWeight: 400 }}>(one per line)</span></label>
        <textarea
          value={features.join("\n")}
          onChange={e => onChange("features", e.target.value.split("\n"))}
          rows={8}
          style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.82rem", color: "#0f172a", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.7 }}
        />
        <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>{features.filter(f => f.trim()).length} features</p>
      </div>
    </div>
  );
}

export default function PricingAdmin({ settings }: { settings: Settings }) {
  const [data, setData] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (plan: "starter" | "pro", field: string, value: any) => {
    setData(prev => ({ ...prev, [`${plan}${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await savePricingSettings(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="adm-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 className="adm-topbar-title" style={{ marginBottom: "0.2rem" }}>Pricing Plans</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>Changes go live on the pricing page immediately after saving.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="adm-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: "120px", justifyContent: "center" }}
        >
          {saved ? <><CheckCircle2 size={14} /> Saved!</> : saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Preview note */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.9rem 1.25rem", marginBottom: "1.5rem", fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        💡 The Free plan is not editable here — it has no payment. Edit it directly in code if needed.
      </div>

      {/* Plan editors side by side */}
      <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <PlanEditor
          title="Starter"
          icon={<Zap size={14} color="#e5484d" />}
          color="#e5484d"
          price={data.starterPrice}
          credits={data.starterCredits}
          description={data.starterDescription}
          features={data.starterFeatures}
          onChange={(field, value) => update("starter", field, value)}
        />
        <PlanEditor
          title="Pro"
          icon={<Shield size={14} color="#6366f1" />}
          color="#6366f1"
          price={data.proPrice}
          credits={data.proCredits}
          description={data.proDescription}
          features={data.proFeatures}
          onChange={(field, value) => update("pro", field, value)}
        />
      </div>

      {/* Live preview */}
      <div className="adm-card" style={{ padding: "1.5rem" }}>
        <h4 style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Live Preview</h4>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Starter", price: data.starterPrice, credits: data.starterCredits, desc: data.starterDescription, features: data.starterFeatures, color: "#e5484d" },
            { label: "Pro", price: data.proPrice, credits: data.proCredits, desc: data.proDescription, features: data.proFeatures, color: "#6366f1" },
          ].map(plan => (
            <div key={plan.label} style={{ flex: 1, minWidth: "220px", border: `1.5px solid ${plan.color}30`, borderRadius: "1rem", padding: "1.25rem" }}>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{plan.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a" }}>${plan.price}</span>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>one-time</span>
              </div>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", color: "#64748b" }}>{plan.desc}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {plan.features.filter(f => f.trim()).map((f, i) => (
                  <li key={i} style={{ fontSize: "0.78rem", color: "#334155", padding: "0.2rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ color: plan.color, fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
