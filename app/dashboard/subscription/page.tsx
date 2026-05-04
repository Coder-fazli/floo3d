"use client";

import Navbar from "@/components/Navbar";
import { AutoTopUpCard } from "../profile/AutoTopUpCard";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/actions";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
  custom: "Custom",
};

export default function SubscriptionPage() {
  const { user } = useUser();
  const [info, setInfo] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserInfo(user.id).then(setInfo);
  }, [user]);

  const planLabel = info?.subscriptionPlan ? PLAN_LABELS[info.subscriptionPlan] ?? info.subscriptionPlan : null;
  const isCancelScheduled = !!info?.cancelAtPeriodEnd;
  const subscriptionDate = isCancelScheduled ? info?.cancelAt ?? info?.currentPeriodEnd : info?.currentPeriodEnd;
  const dateLabel = isCancelScheduled ? "Cancels on" : "Renews on";
  const periodEnd = subscriptionDate ? new Date(subscriptionDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  const handleCancelSubscription = async () => {
    const shouldCancel = window.confirm(
      "Cancel your subscription at the end of the current billing period?"
    );
    if (!shouldCancel) return;

    try {
      setCancelLoading(true);
      setCancelError(null);

      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      setInfo((prev: any) => ({
        ...prev,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? true,
        cancelAt: data.cancelAt ? new Date(data.cancelAt * 1000).toISOString() : prev?.currentPeriodEnd ?? null,
      }));
    } catch (error: any) {
      setCancelError(error?.message || "Could not cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="home">
      <Navbar />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "100px", paddingBottom: "60px", padding: "100px 1.5rem 60px" }}>
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <a href="/dashboard" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none", display: "inline-block", marginBottom: "1.5rem" }}>← Back to Dashboard</a>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#27282f", margin: "0 0 1.75rem", letterSpacing: "-0.02em" }}>My Subscription</h1>

          {/* Plan card */}
          <div style={{ background: "#fff", border: "1px solid #e8e4df", borderRadius: "1rem", padding: "1.75rem", marginBottom: "1.25rem" }}>
            <p style={{ margin: "0 0 0.2rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>Current Plan</p>

            {info?.subscriptionPlan ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#27282f" }}>{planLabel}</span>
                    <span style={{ marginLeft: "0.6rem", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "9999px", background: isCancelScheduled ? "#fef3c7" : info.subscriptionStatus === "active" ? "#dcfce7" : "#fee2e2", color: isCancelScheduled ? "#b45309" : info.subscriptionStatus === "active" ? "#16a34a" : "#dc2626", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {info.subscriptionStatus ?? "—"}
                    </span>
                  </div>
                  <a href="/pricing" target="_blank" style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand-color)", textDecoration: "none" }}>
                    Change plan →
                  </a>
                </div>
                {periodEnd && (
                  <p style={{ margin: "0.75rem 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                    {dateLabel} <strong>{periodEnd}</strong>
                  </p>
                )}
                {isCancelScheduled ? (
                  <div style={{ marginTop: "1rem", padding: "0.85rem 1rem", borderRadius: "0.75rem", background: "#fff7ed", border: "1px solid #fed7aa" }}>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#9a3412", lineHeight: 1.5 }}>
                      Your subscription is still active for the rest of the current billing period. No further renewal will be charged.
                    </p>
                  </div>
                ) : (
                  <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem" }}>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      style={{
                        padding: "0.55rem 1rem",
                        background: "#fff7f7",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        borderRadius: "0.5rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        cursor: cancelLoading ? "wait" : "pointer",
                      }}
                    >
                      {cancelLoading ? "Canceling..." : "Cancel Subscription"}
                    </button>
                    {cancelError && (
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "#dc2626" }}>
                        {cancelError}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: "0.75rem" }}>
                <p style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", color: "#475569" }}>You're on the free plan.</p>
                <a href="/pricing" style={{ display: "inline-block", padding: "0.55rem 1.25rem", background: "var(--brand-color)", color: "#fff", borderRadius: "0.375rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none" }}>
                  Upgrade Now
                </a>
              </div>
            )}
          </div>

          {/* Auto top-up + credits */}
          <AutoTopUpCard />
        </div>
      </div>
    </div>
  );
}
