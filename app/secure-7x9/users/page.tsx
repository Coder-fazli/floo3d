import { Search } from "lucide-react";
import Link from "next/link";
import { getAllUSers } from "@/lib/actions";


export default async function AdminUsers() {
  const users = await getAllUSers();
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
              {users.map((u) => (
                <tr key={u.clerkId}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-user-avatar">
                        <span>{u.name?.[0] ?? "?"}</span>
                      </div>
                      <div>
                        <p className="adm-user-name">{u.name}</p>
                        <p className="adm-user-email">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{u.clerkId}</td>
                  <td>
                    <input className="adm-credits-input" type="number" defaultValue={u.credits} />
                  </td>
                  <td>0</td>
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
