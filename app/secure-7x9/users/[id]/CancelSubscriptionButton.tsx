"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

type Props = {
  clerkId: string;
  hasSubscription: boolean;
  cancelScheduled: boolean;
  name: string;
};

export default function CancelSubscriptionButton({
  clerkId,
  hasSubscription,
  cancelScheduled,
  name,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const disabled = loading || !hasSubscription || cancelScheduled;

  const handleCancel = async () => {
    if (!hasSubscription || cancelScheduled) return;
    if (!window.confirm(`Cancel ${name || "this user's"} subscription at period end?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/cancel-user-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      router.refresh();
    } catch (error: any) {
      alert(error?.message || "Failed to cancel subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="adm-danger-btn"
      onClick={handleCancel}
      disabled={disabled}
      style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <ShoppingBag size={14} />
      {loading
        ? "Canceling…"
        : cancelScheduled
          ? "Cancellation Scheduled"
          : hasSubscription
            ? "Cancel Subscription"
            : "No Subscription"}
    </button>
  );
}
