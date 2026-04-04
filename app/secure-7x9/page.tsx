import { getAllUSers, getAllProjects } from "@/lib/actions.admin";

export default async function AdminOverview() {
  const users = await getAllUSers();
  const projects = await getAllProjects();

  const totalUsers = users.length;
  const totalProjects = projects.length;
  const rendersCompleted = projects.filter((p: any) => p.renderedImageUrl).length;
  const totalCredits = users.reduce((sum: number, u: any) => sum + (u.credits ?? 0), 0);
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="adm-content">
      <h1 className="adm-topbar-title" style={{ marginBottom: "2rem" }}>Overview</h1>

      {/* Stats */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <p className="adm-stat-label">Total Users</p>
          <h3 className="adm-stat-value">{totalUsers}</h3>
        </div>
        <div className="adm-stat-card">
          <p className="adm-stat-label">Total Projects</p>
          <h3 className="adm-stat-value">{totalProjects}</h3>
        </div>
        <div className="adm-stat-card">
          <p className="adm-stat-label">Renders Completed</p>
          <h3 className="adm-stat-value">{rendersCompleted}</h3>
        </div>
        <div className="adm-stat-card">
          <p className="adm-stat-label">Credits in Circulation</p>
          <h3 className="adm-stat-value">{totalCredits}</h3>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="adm-card">
        <div className="adm-table-head">
          <h2 className="adm-table-title">Recent Activity</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.length === 0 ? (
                <tr><td colSpan={3} style={{ color: "#94a3b8", textAlign: "center" }}>No activity yet</td></tr>
              ) : (
                recentProjects.map((p: any) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.name || "Untitled"}</td>
                    <td>
                      <span className={`adm-badge ${p.renderedImageUrl ? "adm-badge-green" : "adm-badge-orange"}`}>
                        {p.renderedImageUrl ? "Completed" : "Processing"}
                      </span>
                    </td>
                    <td style={{ color: "#94a3b8" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
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
