import Link from "next/link";
import { Calendar, MapPin, Plus, Minus, Lock, RotateCcw, Trash2, ChevronLeft } from "lucide-react";

const MOCK_PROJECTS = [
  { id: "1", name: "Modern Living Room", type: "Interior Design", status: "completed", date: "Oct 26, 2023" },
  { id: "2", name: "Urban Loft Apartment", type: "Residential", status: "processing", date: "Oct 28, 2023" },
  { id: "3", name: "Coffee Shop Concept", type: "Commercial", status: "completed", date: "Oct 22, 2023" },
];

export default function AdminUserDetail() {
  return (
    <div className="adm-content">

      {/* Back link */}
      <Link href="/secure-7x9/users" className="adm-action-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        <ChevronLeft size={16} /> Back to Users
      </Link>

      {/* User header card */}
      <div className="adm-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div className="adm-user-header">
          <div className="adm-user-header-avatar">
            A
          </div>
          <div className="adm-user-header-info">
            <div className="adm-user-header-name-row">
              <h3 className="adm-user-header-name">Alex Rivera</h3>
              <span className="adm-badge adm-badge-green">Active</span>
            </div>
            <p className="adm-user-header-email">alex.rivera@example.com</p>
            <div className="adm-user-header-meta">
              <span><Calendar size={13} /> Joined Oct 24, 2023</span>
              <span><MapPin size={13} /> San Francisco, CA</span>
            </div>
          </div>
          <div className="adm-user-header-btns">
            <button className="adm-btn-ghost">Edit Profile</button>
            <button className="adm-btn-primary">Message</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="adm-user-stats-grid">
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Total Projects</p>
          <p className="adm-user-stat-value">12</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Credits Remaining</p>
          <p className="adm-user-stat-value">10</p>
          <p className="adm-user-stat-sub">Renders</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Renders Completed</p>
          <p className="adm-user-stat-value">45</p>
        </div>
        <div className="adm-user-stat">
          <p className="adm-user-stat-label">Member Since</p>
          <p className="adm-user-stat-value" style={{ fontSize: "1.25rem" }}>Oct 2023</p>
        </div>
      </div>

      {/* Credits + Projects grid */}
      <div className="adm-credits-grid">

        {/* Manage Credits */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem" }}>Manage Credits</h4>
          <div className="adm-credits-balance">
            <p className="adm-credits-balance-label">Current Balance</p>
            <p className="adm-credits-balance-val">10 Credits</p>
          </div>
          <div>
            <label className="adm-form-label">Adjust Credits</label>
            <div className="adm-credits-adjust-row">
              <input className="adm-credits-adjust-input" type="number" defaultValue={0} />
              <button className="adm-credits-adjust-btn"><Plus size={16} /></button>
              <button className="adm-credits-adjust-btn"><Minus size={16} /></button>
            </div>
            <p className="adm-credits-hint">Use negative values to remove credits.</p>
          </div>
          <button className="adm-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1.25rem" }}>
            Save Changes
          </button>
        </div>

        {/* Recent Projects */}
        <div className="adm-card" style={{ overflow: "hidden" }}>
          <div className="adm-table-head">
            <h4 className="adm-table-title">Recent Projects</h4>
            <button className="adm-action-link">View All</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="right">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PROJECTS.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="adm-project-cell">
                        <div className="adm-thumb" style={{ width: "2.5rem", height: "2.5rem" }} />
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>{p.name}</p>
                          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge ${p.status === "completed" ? "adm-badge-green" : "adm-badge-orange"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: "#94a3b8" }}>{p.date}</td>
                    <td className="right">
                      <button className="adm-action-link">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <button className="adm-danger-btn adm-danger-btn-solid"><Trash2 size={14} /> Delete Account</button>
        </div>
      </div>

    </div>
  );
}
