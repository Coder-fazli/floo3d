"use client";

import { useEffect, useState } from "react";
import { getAutoTopUpSettings, saveAutoTopUpSettings, getUserInfo } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";

const CREDIT_OPTIONS = [
  { credits: 10, label: "10 credits", price: "$5.00" },
  { credits: 20, label: "20 credits", price: "$10.00" },
  { credits: 50, label: "50 credits", price: "$25.00" },
];

export function AutoTopUpCard() {
  const { user } = useUser();
  const [enabled, setEnabled] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(10);
  const [hasSavedCard, setHasSavedCard] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [planCredits, setPlanCredits] = useState(100);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getAutoTopUpSettings(),
      getUserInfo(user.id),
    ]).then(([s, info]) => {
      setEnabled(s.autoTopUp);
      setSelectedCredits(s.autoTopUpCredits);
      setHasSavedCard(s.hasSavedCard);
      setCurrentCredits(info.credits);
      setSubscriptionPlan(info.subscriptionPlan);
      const PLAN_MAX: Record<string, number> = { starter: 100, pro: 300, elite: 300 };
      setPlanCredits(info.credits >= 99999 ? 99999 : (PLAN_MAX[info.subscriptionPlan ?? ""] ?? info.credits));
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await saveAutoTopUpSettings(enabled, selectedCredits);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const creditsUsed = Math.max(0, planCredits - currentCredits);
  const spentAmount = (creditsUsed * 0.5).toFixed(2);

  // Credits remaining bar — starts full, empties as credits are used
  const remainPct = planCredits >= 99999 ? 100 : Math.min(100, Math.round((currentCredits / planCredits) * 100));
  const remainColor = remainPct > 50 ? "var(--brand-color)" : remainPct > 20 ? "#f97316" : "#ef4444";

  // Spent bar — starts empty, fills as money is spent
  const spentPct = planCredits >= 99999 ? 0 : Math.min(100, Math.round((creditsUsed / planCredits) * 100));

  return (
    <div style={{ width: "100%", maxWidth: "600px", background: "#fff", border: "1px solid #e8e4df", borderRadius: "1rem", padding: "1.75rem", marginBottom: "1.5rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ margin: "0 0 0.2rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>Billing</p>
        <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 700, color: "#27282f" }}>Credit Usage</h3>
      </div>

      {/* Bar 1 — Credits used */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>Credits used</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#27282f" }}>
            {spentPct}%
          </span>
        </div>
        <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${spentPct}%`, background: spentPct < 50 ? "var(--brand-color)" : spentPct < 80 ? "#f97316" : "#ef4444", borderRadius: "9999px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Bar 2 — $ spent (starts empty) */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>Pay as you go</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#27282f" }}>
            ${subscriptionPlan ? spentAmount : "0.00"} spent
          </span>
        </div>
        <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${spentPct}%`, background: "var(--brand-color)", borderRadius: "9999px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
        {/* Toggle row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <div>
            <p style={{ margin: "0 0 0.2rem", fontSize: "0.875rem", fontWeight: 700, color: "#27282f" }}>Auto Top-up</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>Automatically buy credits when you run out</p>
          </div>
          <button
            onClick={() => hasSavedCard && setEnabled(p => !p)}
            disabled={!hasSavedCard}
            style={{ width: "42px", height: "24px", borderRadius: "9999px", border: "none", cursor: hasSavedCard ? "pointer" : "not-allowed", background: enabled ? "var(--brand-color)" : "#e2e8f0", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
          >
            <span style={{ position: "absolute", top: "3px", left: enabled ? "21px" : "3px", width: "18px", height: "18px", borderRadius: "9999px", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </button>
        </div>

        {!hasSavedCard && (
          <p style={{ fontSize: "0.75rem", color: "#92400e", margin: "0 0 0.75rem", background: "#fffbeb", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #fde68a" }}>
            ⚠ Requires an active subscription with a saved card
          </p>
        )}

        {/* Radio options */}
        {enabled && (
          <div style={{ marginTop: "0.75rem" }}>
            <p style={{ margin: "0 0 0.6rem", fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>Credits to buy each time</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {CREDIT_OPTIONS.map(opt => (
                <label
                  key={opt.credits}
                  onClick={() => setSelectedCredits(opt.credits)}
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", padding: "0.65rem 0.875rem", borderRadius: "0.75rem", border: `1.5px solid ${selectedCredits === opt.credits ? "var(--brand-color)" : "#e8e4df"}`, background: selectedCredits === opt.credits ? "rgba(251,59,1,0.04)" : "#fafafa", transition: "all 0.15s" }}
                >
                  <span style={{ width: "16px", height: "16px", borderRadius: "9999px", border: `2px solid ${selectedCredits === opt.credits ? "var(--brand-color)" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff" }}>
                    {selectedCredits === opt.credits && <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "var(--brand-color)" }} />}
                  </span>
                  <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, color: "#27282f" }}>{opt.label}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: selectedCredits === opt.credits ? "var(--brand-color)" : "#94a3b8" }}>{opt.price}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !hasSavedCard}
          style={{ marginTop: "1rem", padding: "0.55rem 1.5rem", background: "var(--brand-color)", color: "#fff", border: "none", borderRadius: "0.375rem", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", cursor: hasSavedCard ? "pointer" : "not-allowed", opacity: hasSavedCard ? 1 : 0.5, transition: "opacity 0.15s" }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
