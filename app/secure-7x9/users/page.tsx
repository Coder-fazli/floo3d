import { Search } from "lucide-react";
import Link from "next/link";

const MOCK_USERS = [
  { id: "USR-82910", name: "David Chen", email: "david.c@example.com", credits: 150, projects: 12, joined: "Oct 12, 2023" },
  { id: "USR-44201", name: "Sarah Miller", email: "sarah.m@example.com", credits: 5, projects: 4, joined: "Nov 3, 2023" },
  { id: "USR-91023", name: "Jordan Smith", email: "jordan.s@example.com", credits: 0, projects: 1, joined: "Nov 20, 2023" },
  { id: "USR-30481", name: "Alex Johnson", email: "alex.j@example.com", credits: 200, projects: 31, joined: "Sep 5, 2023" },
];

export default function AdminUsers() {
  return (
    <div className="adm-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 className="adm-topbar-title">Users</h1>
        <div className="adm-search-wrap">
          <Search size={15} className="adm-search-icon" />
          <input className="adm-search-input" type="text" placeholder="Search users..." />
        </div>
      </div>

      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>User ID</th>
                <th>Credits</th>
                <th>Projects</th>
                <th>Joined</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-user-avatar">
                        <span>{u.name[0]}</span>
                      </div>
                      <div>
                        <p className="adm-user-name">{u.name}</p>
                        <p className="adm-user-email">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{u.id}</td>
                  <td>
                    <input className="adm-credits-input" type="number" defaultValue={u.credits} />
                  </td>
                  <td>{u.projects}</td>
                  <td style={{ color: "#94a3b8" }}>{u.joined}</td>
                  <td className="right" style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <Link href={`/secure-7x9/users/${u.id}`} className="adm-action-link">View</Link>
                    <button className="adm-action-link adm-action-link-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
