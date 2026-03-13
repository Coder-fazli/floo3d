export default function AdminOverview() {
  return (
    <div className="adm-content">
      <h1 className="adm-topbar-title" style={{ marginBottom: "2rem" }}>Overview</h1>

      {/* Stats */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <p className="adm-stat-label">Total Users</p>
          <h3 className="adm-stat-value">1,284</h3>
          <p className="adm-stat-trend">↑ 12% since last month</p>
        </div>
        <div className="adm-stat-card">
          <p className="adm-stat-label">Total Projects</p>
          <h3 className="adm-stat-value">4,592</h3>
          <p className="adm-stat-trend">↑ 8% since last month</p>
        </div>
        <div className="adm-stat-card">
          <p className="adm-stat-label">Renders Completed</p>
          <h3 className="adm-stat-value">12,403</h3>
          <p className="adm-stat-trend">↑ 24% since last month</p>
        </div>
        <div className="adm-stat-card">
          <p className="adm-stat-label">Credits Given</p>
          <h3 className="adm-stat-value">50,000</h3>
          <p className="adm-stat-trend adm-stat-trend-neutral">Manual admin distribution</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="adm-card">
        <div className="adm-table-head">
          <h2 className="adm-table-title">Recent Activity</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alex Johnson</td>
                <td><span className="adm-badge adm-badge-green">Rendered</span></td>
                <td>Modern Kitchen 2D</td>
                <td style={{ color: "#94a3b8" }}>2 mins ago</td>
              </tr>
              <tr>
                <td>Sarah Miller</td>
                <td><span className="adm-badge adm-badge-blue">Uploaded</span></td>
                <td>Main Office Floorplan</td>
                <td style={{ color: "#94a3b8" }}>1 hour ago</td>
              </tr>
              <tr>
                <td>David Chen</td>
                <td><span className="adm-badge adm-badge-green">Rendered</span></td>
                <td>Luxury Apartment A</td>
                <td style={{ color: "#94a3b8" }}>3 hours ago</td>
              </tr>
              <tr>
                <td>Jordan Smith</td>
                <td><span className="adm-badge adm-badge-orange">Registered</span></td>
                <td>New Account</td>
                <td style={{ color: "#94a3b8" }}>5 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
