import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Lock, RotateCcw, Trash2, ChevronLeft, ShoppingBag, Activity } from "lucide-react";
import { getUserByClerkId, getProjects } from "@/lib/actions";
import { updateUserCredits, deleteUSer, getOrdersByUser, getLogsByUser } from "@/lib/actions.admin";
import AdminViewButton from "./AdminViewButton";

const MODEL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "gemini-3-pro-image-preview":     { label: "StyleAI Pro",   color: "#7c3aed", bg: "#ede9fe" },
  "gemini-3.1-flash-image-preview": { label: "StyleAI Flash", color: "#0369a1", bg: "#e0f2fe" },
  "gemini-2.5-flash-image":         { label: "StyleAI Lite",  color: "#64748b", bg: "#f1f5f9" },
};

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, projects, orders, logs] = await Promise.all([
    getUserByClerkId(id),
    getProjects(id),
    getOrdersByUser(id),
    getLogsByUser(id),
  ]);

  if (!user) return <div className="adm-content">User not found: {id}</div>;

  const totalProjects = projects.length;
  const rendersCompleted = projects.filter((p: any) => p.renderedImageUrl).length;
  const recentProjects = projects.slice(0, 5);

  // Tracking Generations Count
  const totalGenerations = projects.reduce((sum: number, p: any) => sum + (p.generationCount ?? 0), 0);
 // Tracking Downloads Count
 const totalDownloads = projects.filter((p: any) => 
 p.downloadedAt).length;



  async function saveCredits(formData: FormData) {
    "use server";
    const val = Number(formData.get("credits"));
    await updateUserCredits(id, val);
    redirect(`/secure-7x9/users/${id}`);
  }

  async function handleDelete() {
    "use server";
    await deleteUSer(id);
    redirect("/secure-7x9/users");
  }

  return (
    <div className="adm-content">

      <Link href="/secure-7x9/users" className="adm-action-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        <ChevronLeft size={16} /> Back to Users
      </Link>

      {/* User header card */}
      <div className="adm-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div className="adm-user-header">
          <div className="adm-user-header-avatar" style={{ overflow: "hidden", padding: 0 }}>
            {user.imageUrl
              ? <img src={user.imageUrl} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>{user.name?.[0]?.toUpperCase() ?? "?"}</span>
            }
          </div>
          <div className="adm-user-header-info">
            <div className="adm-user-header-name-row">
              <h3 className="adm-user-header-name">{user.name || "No Name"}</h3>
              <span className="adm-badge adm-badge-green">Active</span>
            </div>
            <p className="adm-user-header-email">{user.email}</p>
            <div className="adm-user-header-meta">
              <span><Calendar size={13} /> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="adm-user-stats-grid">
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Total Projects</p>
          <p className="adm-user-stat-value">{totalProjects}</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Credits Remaining</p>
          <p className="adm-user-stat-value">{user.credits}</p>
          <p className="adm-user-stat-sub">Credits</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Renders Completed</p>
          <p className="adm-user-stat-value">{rendersCompleted}</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Total Generations</p>
          <p className="adm-user-stat-value">{totalGenerations}</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Credits Used</p>
          <p className="adm-user-stat-value">{totalGenerations * 3}</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Downloads</p>
          <p className="adm-user-stat-value">{totalDownloads}</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Member Since</p>
          <p className="adm-user-stat-value" style={{ fontSize: "1.25rem" }}>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
          </p>
        </div>
      </div>

      {/* Credits + Projects grid */}
      <div className="adm-credits-grid">

        {/* Manage Credits */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem" }}>Manage Credits</h4>
          <div className="adm-credits-balance">
            <p className="adm-credits-balance-label">Current Balance</p>
            <p className="adm-credits-balance-val">{user.credits} Credits</p>
          </div>
          <form action={saveCredits}>
            <label className="adm-form-label">Set New Balance</label>
            <div className="adm-credits-adjust-row">
              <input className="adm-credits-adjust-input" type="number" name="credits" defaultValue={user.credits} />
            </div>
            <p className="adm-credits-hint">This will set the exact credit balance for this user.</p>
            <button type="submit" className="adm-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1.25rem" }}>
              Save Changes
            </button>
          </form>
        </div>

        {/* Recent Projects */}
        <div className="adm-card" style={{ overflow: "hidden" }}>
          <div className="adm-table-head">
            <h4 className="adm-table-title">Recent Projects</h4>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Style</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.length === 0 ? (
                  <tr><td colSpan={4} style={{ color: "#94a3b8", textAlign: "center" }}>No projects yet</td></tr>
                ) : (
                  recentProjects.map((p: any) => (
                    <tr key={p._id}>
                      <td>
                        <div className="adm-project-cell">
                          <div className="adm-thumb" style={{ width: "2.5rem", height: "2.5rem" }}>
                            {p.originalImageUrl && <img src={p.originalImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.375rem" }} />}
                          </div>
                          <div>
                            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>{p.name || "Untitled"}</p>
                            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{p.inputType}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{p.inputType ?? "—"}</td>
                      <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{p.renderStyle ?? "—"}</td>
                      <td>
                        <span className={`adm-badge ${p.renderedImageUrl ? "adm-badge-green" : "adm-badge-orange"}`}>
                          {p.renderedImageUrl ? "Completed" : "Processing"}
                        </span>
                      </td>
                      <td style={{ color: "#94a3b8" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="right" style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                        <AdminViewButton projectId={p._id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="adm-card" style={{ overflow: "hidden", marginBottom: "1.5rem" }}>
        <div className="adm-table-head">
          <h4 className="adm-table-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={16} /> Purchase History
          </h4>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Total spent: ${((orders.reduce((s: number, o: any) => s + (o.amount ?? 0), 0)) / 100).toFixed(2)}
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Credits</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Country</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} style={{ color: "#94a3b8", textAlign: "center" }}>No purchases yet</td></tr>
              ) : (
                orders.map((o: any) => (
                  <tr key={o._id}>
                    <td style={{ color: "#94a3b8" }}>{new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "999px", background: o.plan === "pro" ? "#ede9fe" : "#fef3c7", color: o.plan === "pro" ? "#7c3aed" : "#d97706" }}>
                        {o.plan ? o.plan.charAt(0).toUpperCase() + o.plan.slice(1) : "—"}
                      </span>
                    </td>
                    <td>+{o.credits ?? "—"}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>${((o.amount ?? 0) / 100).toFixed(2)}</td>
                    <td style={{ fontSize: "0.78rem", color: "#64748b" }}>{o.paymentMethod ?? "—"}</td>
                    <td style={{ fontSize: "0.78rem", color: "#64748b" }}>{o.country ?? "—"}</td>
                    <td>{o.receiptUrl ? <a href={o.receiptUrl} target="_blank" style={{ color: "#ec5b13", fontSize: "0.78rem", fontWeight: 600 }}>View ↗</a> : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generation Logs */}
      <div className="adm-card" style={{ overflow: "hidden", marginBottom: "1.5rem" }}>
        <div className="adm-table-head">
          <h4 className="adm-table-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Activity size={16} /> Generation Logs
          </h4>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Last 50 generations</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Model</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} style={{ color: "#94a3b8", textAlign: "center" }}>No generations yet</td></tr>
              ) : (
                logs.map((l: any) => (
                  <tr key={l._id}>
                    <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ fontSize: "0.78rem" }}>{l.inputType}</td>
                    <td>
                      {l.model ? (
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "999px", background: MODEL_LABELS[l.model]?.bg ?? "#f1f5f9", color: MODEL_LABELS[l.model]?.color ?? "#64748b" }}>
                          {MODEL_LABELS[l.model]?.label ?? l.model}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{l.duration ? `${(l.duration / 1000).toFixed(1)}s` : "—"}</td>
                    <td>
                      <span className={`adm-badge ${l.status === "success" ? "adm-badge-green" : "adm-badge-red"}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.72rem", color: "#ef4444", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.errorMessage ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="adm-danger-zone">
        <div className="adm-danger-title-row">
          <Trash2 size={18} color="#b91c1c" />
          <h4 className="adm-danger-title">Danger Zone</h4>
        </div>
        <p className="adm-danger-desc">These actions are destructive and cannot be undone. Please proceed with caution.</p>
        <div className="adm-danger-btns">
          <button className="adm-danger-btn"><Lock size={14} /> Suspend Account</button>
          <button className="adm-danger-btn"><RotateCcw size={14} /> Reset Credits</button>
          <form action={handleDelete} style={{ display: "inline" }}>
            <button type="submit" className="adm-danger-btn adm-danger-btn-solid"><Trash2 size={14} /> Delete Account</button>
          </form>
        </div>
      </div>

    </div>
  );
}
