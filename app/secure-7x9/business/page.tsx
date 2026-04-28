import Link from "next/link";
import { getBusinessAnalytics } from "@/lib/actions.admin";
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, BarChart2 } from "lucide-react";

const PERIODS = [
  { value: "today",     label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week",      label: "This Week" },
  { value: "month",     label: "This Month" },
  { value: "all",       label: "All Time" },
];

const USER_TYPES = [
  { value: "all",  label: "All Users" },
  { value: "free", label: "Free Users" },
  { value: "paid", label: "Paid Users" },
];

const TOOL_LABELS: Record<string, string> = {
  "floor-plan":           "Floor Plan",
  "interior-design":      "Interior Design",
  "outdoor":              "Outdoor",
  "empty-room":           "Empty Room",
  "floor-plan-generator": "FP Generator",
};

function fmt(n: number) { return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`; }
function fmtDate(d: string) {
  if (d.includes("T")) {
    const h = parseInt(d.split("T")[1]);
    return `${h}:00`;
  }
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function BusinessPage({ searchParams }: { searchParams: Promise<{ period?: string; type?: string }> }) {
  const { period = "week", type = "all" } = await searchParams;
  const userType = (["all","free","paid"].includes(type) ? type : "all") as "all"|"free"|"paid";
  const d = await getBusinessAnalytics(period, userType);
  const periodLabel = PERIODS.find(p => p.value === period)?.label ?? "This Week";
  const maxBar = Math.max(...d.revenueChart.map((r: any) => r.amount), 0.01);

  return (
    <div className="adm-content">

      {/* Header + Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        {/* Left: title + user type tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <h1 className="adm-topbar-title" style={{ margin: 0 }}>Business</h1>
          <div style={{ display: "flex", gap: "0.4rem", background: "#f1f5f9", borderRadius: "0.75rem", padding: "0.3rem", width: "fit-content" }}>
            {USER_TYPES.map(u => (
              <Link key={u.value} href={`/secure-7x9/business?period=${period}&type=${u.value}`} style={{
                padding: "0.3rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600,
                textDecoration: "none",
                background: userType === u.value ? "#fff" : "transparent",
                color: userType === u.value ? (u.value === "paid" ? "#16a34a" : u.value === "free" ? "#d97706" : "#0f172a") : "#64748b",
                boxShadow: userType === u.value ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>{u.label}</Link>
            ))}
          </div>
        </div>
        {/* Right: period filter */}
        <div style={{ display: "flex", gap: "0.4rem", background: "#f1f5f9", borderRadius: "0.75rem", padding: "0.3rem" }}>
          {PERIODS.map(p => (
            <Link key={p.value} href={`/secure-7x9/business?period=${p.value}&type=${userType}`} style={{
              padding: "0.35rem 0.85rem", borderRadius: "0.5rem", fontSize: "0.78rem", fontWeight: 600,
              textDecoration: "none",
              background: period === p.value ? "#fff" : "transparent",
              color: period === p.value ? "#0f172a" : "#64748b",
              boxShadow: period === p.value ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>{p.label}</Link>
          ))}
        </div>
      </div>

      {/* P&L Top Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>

        {/* Revenue */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Revenue</p>
            <div style={{ width: "1.8rem", height: "1.8rem", borderRadius: "0.4rem", background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={13} color="#16a34a" />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "#16a34a" }}>{fmt(d.recognizedRevenue)}</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
            {fmt(d.revenue)} cash · {d.allOrders.length} orders
          </p>
        </div>

        {/* Total AI Cost */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Costs</p>
            <div style={{ width: "1.8rem", height: "1.8rem", borderRadius: "0.4rem", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={13} color="#ef4444" />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "#ef4444" }}>-{fmt(d.totalCost)}</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>{d.totalRenders} renders</p>
        </div>

        {/* Net Profit */}
        <div className="adm-card" style={{ padding: "1.5rem", background: d.netProfit >= 0 ? "#0f172a" : "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: d.netProfit >= 0 ? "#475569" : "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Net Profit</p>
            {d.netProfit >= 0
              ? <TrendingUp size={14} color="#22c55e" />
              : <TrendingDown size={14} color="#ef4444" />}
          </div>
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: d.netProfit >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(d.netProfit)}</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: d.netProfit >= 0 ? "#475569" : "#94a3b8" }}>recognized revenue − AI costs</p>
        </div>

        {/* Margin */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Margin</p>
            <div style={{ width: "1.8rem", height: "1.8rem", borderRadius: "0.4rem", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={13} color="#6366f1" />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "#6366f1" }}>{d.margin.toFixed(1)}%</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>profit margin</p>
        </div>
      </div>

      {/* Cost breakdown + Conversion + Tool usage */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>

        {/* Cost breakdown */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>AI Cost Breakdown</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Paid users ({d.paidRenders} renders)</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>{fmt(d.paidCost)}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px" }}>
                <div style={{ height: "100%", borderRadius: "999px", background: "#6366f1", width: `${d.totalRenders > 0 ? (d.paidRenders / d.totalRenders) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Free users ({d.freeRenders} renders)</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ef4444" }}>{fmt(d.freeCost)}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px" }}>
                <div style={{ height: "100%", borderRadius: "999px", background: "#ef4444", width: `${d.totalRenders > 0 ? (d.freeRenders / d.totalRenders) * 100 : 0}%` }} />
              </div>
            </div>
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>Total AI cost</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a" }}>{fmt(d.totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Conversion rate */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>Conversion Rate</h4>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: "#6366f1", lineHeight: 1 }}>{d.conversionRate.toFixed(1)}%</div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>of users converted to paid</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>{d.paidUsersCount}</p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>Paid</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>{d.totalUsers - d.paidUsersCount}</p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>Free</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>{d.totalUsers}</p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>Total</p>
            </div>
          </div>
        </div>

        {/* Most used tool */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>Most Used Tool</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {d.toolUsage.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>No data</p>
            ) : d.toolUsage.map((t: any, i: number) => (
              <div key={t.tool}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "#334155", fontWeight: i === 0 ? 700 : 500 }}>
                    {i === 0 ? "🏆 " : ""}{TOOL_LABELS[t.tool] ?? t.tool}
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>{t.count}</span>
                </div>
                <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "999px" }}>
                  <div style={{ height: "100%", borderRadius: "999px", background: i === 0 ? "var(--brand-color)" : "#e2e8f0", width: `${(t.count / d.totalRenders) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="adm-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
        <h4 style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{d.isHourly ? "Hourly Revenue" : "Daily Revenue"}</h4>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.4rem", height: "120px" }}>
          {d.revenueChart.map((r: any) => (
            <div key={r.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div
                  title={`${fmtDate(r.date)}: ${fmt(r.amount)}`}
                  style={{
                    width: "100%",
                    height: `${Math.max((r.amount / maxBar) * 100, r.amount > 0 ? 4 : 1)}%`,
                    background: r.amount > 0 ? "var(--brand-color)" : "#f1f5f9",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s",
                    cursor: "pointer",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.6rem", color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtDate(r.date).split(" ")[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All Orders Table */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div className="adm-table-head">
          <h4 className="adm-table-title">All Orders</h4>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Total: <strong style={{ color: "#16a34a" }}>{fmt(d.revenue)}</strong></span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Credits</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Country</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {d.allOrders.length === 0 ? (
                <tr><td colSpan={8} style={{ color: "#94a3b8", textAlign: "center" }}>No orders in this period</td></tr>
              ) : (
                d.allOrders.map((o: any) => (
                  <tr key={o._id}>
                    <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td style={{ fontSize: "0.78rem" }}>{o.email ?? "—"}</td>
                    <td>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", background: o.plan === "pro" ? "#ede9fe" : "#fef3c7", color: o.plan === "pro" ? "#7c3aed" : "#d97706" }}>
                        {o.plan ? o.plan.charAt(0).toUpperCase() + o.plan.slice(1) : "—"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.78rem" }}>+{o.credits ?? "—"}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>{fmt((o.amount ?? 0) / 100)}</td>
                    <td style={{ fontSize: "0.78rem", color: "#64748b" }}>{o.paymentMethod ?? "—"}</td>
                    <td style={{ fontSize: "0.78rem", color: "#64748b" }}>{o.country ?? "—"}</td>
                    <td>{o.receiptUrl ? <a href={o.receiptUrl} target="_blank" style={{ color: "var(--brand-color)", fontSize: "0.78rem", fontWeight: 600 }}>View ↗</a> : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
