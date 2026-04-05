import Link from "next/link";
import { getAnalytics } from "@/lib/actions.admin";
import { Users, Layers, TrendingUp, AlertTriangle, ShoppingBag, Zap } from "lucide-react";

const PERIODS = [
  { value: "today",     label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week",      label: "This Week" },
  { value: "month",     label: "This Month" },
  { value: "all",       label: "All Time" },
];

function fmt(date: string) {
  return new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period = "today" } = await searchParams;
  const d = await getAnalytics(period);

  const periodLabel = PERIODS.find(p => p.value === period)?.label ?? "Today";

  return (
    <div className="adm-content">

      {/* Header + Filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="adm-topbar-title" style={{ marginBottom: "0.2rem" }}>Overview</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>Showing data for: <strong style={{ color: "#0f172a" }}>{periodLabel}</strong></p>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", background: "#f1f5f9", borderRadius: "0.75rem", padding: "0.3rem" }}>
          {PERIODS.map(p => (
            <Link
              key={p.value}
              href={`/secure-7x9?period=${p.value}`}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "0.5rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                textDecoration: "none",
                background: period === p.value ? "#fff" : "transparent",
                color: period === p.value ? "#0f172a" : "#64748b",
                boxShadow: period === p.value ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1rem" }}>

        {/* BIG: Renders */}
        <div className="adm-card" style={{ gridColumn: "span 3", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Renders</p>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(236,91,19,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} color="#ec5b13" />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{d.newRenders}</h2>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>successful generations</p>
        </div>

        {/* BIG: Revenue */}
        <div className="adm-card" style={{ gridColumn: "span 3", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", background: "#0f172a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Revenue</p>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={14} color="#22c55e" />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>${(d.revenue / 100).toFixed(2)}</h2>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#475569" }}>from {d.recentPurchases?.length ?? 0} purchases</p>
        </div>

        {/* BIG: New Users */}
        <div className="adm-card" style={{ gridColumn: "span 3", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>New Users</p>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={14} color="#6366f1" />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{d.newUsers}</h2>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>signed up</p>
        </div>

        {/* SMALL: Errors */}
        <div className="adm-card" style={{ gridColumn: "span 3", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Errors</p>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={14} color="#ef4444" />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 800, color: d.errors > 0 ? "#ef4444" : "#0f172a", lineHeight: 1 }}>{d.errors}</h2>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>failed generations</p>
        </div>

        {/* SMALL: Total Users */}
        <div className="adm-card" style={{ gridColumn: "span 2", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Users</p>
          <h3 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>{d.totalUsers}</h3>
        </div>

        {/* SMALL: Total Projects */}
        <div className="adm-card" style={{ gridColumn: "span 2", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Projects</p>
          <h3 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>{d.totalProjects}</h3>
        </div>

        {/* SMALL: Orders */}
        <div className="adm-card" style={{ gridColumn: "span 2", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Orders</p>
          <h3 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>{d.recentPurchases?.length ?? 0}</h3>
        </div>

        {/* Recently Active Users */}
        <div className="adm-card" style={{ gridColumn: "span 6", padding: 0, overflow: "hidden" }}>
          <div className="adm-table-head">
            <h4 className="adm-table-title" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Users size={14} /> Recently Active Users
            </h4>
          </div>
          <div style={{ padding: "0.5rem 0" }}>
            {d.recentlyActive.map((u: any) => (
              <Link key={u._id} href={`/secure-7x9/users/${u.clerkId}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1.25rem", textDecoration: "none", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#64748b", flexShrink: 0 }}>
                  {u.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || "No Name"}</p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", background: u.hasPurchased ? "#ede9fe" : "#f1f5f9", color: u.hasPurchased ? "#7c3aed" : "#64748b", flexShrink: 0 }}>
                  {u.hasPurchased ? "Pro" : "Free"}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", flexShrink: 0 }}>{u.credits} cr</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="adm-card" style={{ gridColumn: "span 6", padding: 0, overflow: "hidden" }}>
          <div className="adm-table-head">
            <h4 className="adm-table-title" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <ShoppingBag size={14} /> Recent Purchases
            </h4>
          </div>
          {d.recentPurchases.length === 0 ? (
            <p style={{ padding: "1.25rem", color: "#94a3b8", fontSize: "0.82rem", textAlign: "center" }}>No purchases in this period</p>
          ) : (
            <div style={{ padding: "0.5rem 0" }}>
              {d.recentPurchases.map((o: any) => (
                <div key={o._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#0f172a" }}>{o.email ?? "Unknown"}</p>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>{fmt(o.createdAt)}</p>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", background: o.plan === "pro" ? "#ede9fe" : "#fef3c7", color: o.plan === "pro" ? "#7c3aed" : "#d97706" }}>
                    {o.plan ? o.plan.charAt(0).toUpperCase() + o.plan.slice(1) : "—"}
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#16a34a" }}>${((o.amount ?? 0) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Renders */}
        <div className="adm-card" style={{ gridColumn: "span 7", overflow: "hidden" }}>
          <div className="adm-table-head">
            <h4 className="adm-table-title" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Layers size={14} /> Recent Renders
            </h4>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Model</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {d.recentRenders.length === 0 ? (
                  <tr><td colSpan={4} style={{ color: "#94a3b8", textAlign: "center" }}>No renders in this period</td></tr>
                ) : (
                  d.recentRenders.map((r: any) => (
                    <tr key={r._id}>
                      <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{fmt(r.createdAt)}</td>
                      <td style={{ fontSize: "0.78rem" }}>{r.inputType}</td>
                      <td style={{ fontSize: "0.72rem", color: "#64748b" }}>{r.model}</td>
                      <td style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{r.duration ? `${(r.duration / 1000).toFixed(1)}s` : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="adm-card" style={{ gridColumn: "span 5", overflow: "hidden" }}>
          <div className="adm-table-head">
            <h4 className="adm-table-title" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: d.recentErrors?.length > 0 ? "#ef4444" : undefined }}>
              <AlertTriangle size={14} /> Recent Errors
            </h4>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {d.recentErrors.length === 0 ? (
                  <tr><td colSpan={3} style={{ color: "#16a34a", textAlign: "center", fontSize: "0.82rem" }}>✓ No errors</td></tr>
                ) : (
                  d.recentErrors.map((e: any) => (
                    <tr key={e._id}>
                      <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{fmt(e.createdAt)}</td>
                      <td style={{ fontSize: "0.78rem" }}>{e.inputType}</td>
                      <td style={{ fontSize: "0.72rem", color: "#ef4444", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.errorMessage ?? "Unknown"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
