import { Eye } from "lucide-react";

const MOCK_PROJECTS = [
  { id: "1", name: "Luxury Apartment A", owner: "Jordan Smith", status: "completed", date: "2023-11-05" },
  { id: "2", name: "Modern Kitchen 2D", owner: "Alex Johnson", status: "completed", date: "2023-11-04" },
  { id: "3", name: "Main Office Floorplan", owner: "Sarah Miller", status: "processing", date: "2023-11-03" },
  { id: "4", name: "Urban Loft Apartment", owner: "David Chen", status: "processing", date: "2023-11-02" },
];

export default function AdminProjects() {
  return (
    <div className="adm-content">
      <h1 className="adm-topbar-title" style={{ marginBottom: "1.5rem" }}>Projects</h1>

      <div className="adm-filter-tabs">
        <button className="adm-filter-tab adm-filter-tab-active">All Projects</button>
        <button className="adm-filter-tab">Processing</button>
        <button className="adm-filter-tab">Completed</button>
      </div>

      <div className="adm-card" style={{ overflow: "hidden" }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Created</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PROJECTS.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="adm-project-cell">
                    <div className="adm-thumb" />
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ color: "#64748b" }}>{p.owner}</td>
                <td>
                  <span className={`adm-badge ${p.status === "completed" ? "adm-badge-green" : "adm-badge-orange"}`}>
                    {p.status}
                  </span>
                </td>
                <td style={{ color: "#94a3b8" }}>{p.date}</td>
                <td className="right">
                  <button className="adm-action-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Eye size={14} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
