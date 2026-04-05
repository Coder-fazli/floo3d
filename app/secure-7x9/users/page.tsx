import { Search } from "lucide-react";
import Link from "next/link";
import { getAllUSers, getAllProjects } from "@/lib/actions.admin";


export default async function AdminUsers() {
  const [users, projects] = await Promise.all([getAllUSers(), getAllProjects()]);
  const projectCountByUser: Record<string, number> = {};
  for (const p of projects) {
    projectCountByUser[p.userId] = (projectCountByUser[p.userId] ?? 0) + 1;
  }
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
                <th>Plan</th>
                <th>Credits</th>
                <th>Projects</th>
                <th>Joined</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.clerkId}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-user-avatar">
                        {u.imageUrl
                          ? <img src={u.imageUrl} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                          : <span>{u.name?.[0] ?? "?"}</span>
                        }
                      </div>
                      <div>
                        <p className="adm-user-name">{u.name}</p>
                        <p className="adm-user-email">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.55rem", borderRadius: "999px", background: u.hasPurchased ? "#ede9fe" : "#f1f5f9", color: u.hasPurchased ? "#7c3aed" : "#64748b" }}>
                      {u.hasPurchased ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td>
                    <input className="adm-credits-input" type="number" defaultValue={u.credits} />
                  </td>
                  <td>{projectCountByUser[u.clerkId] ?? 0}</td>
                  <td style={{ color: "#94a3b8" }}>{u.createdAt}</td>
                  <td className="right" style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <Link href={`/secure-7x9/users/${u.clerkId}`} className="adm-action-link">View</Link>
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
