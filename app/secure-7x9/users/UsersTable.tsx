"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { DeleteUserButton } from "./DeleteUserButton";

const COUNTRY_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

interface Props {
  users: any[];
  projectCountByUser: Record<string, number>;
}

export function UsersTable({ users, projectCountByUser }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? users.filter(u => {
        const q = query.toLowerCase();
        return (
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
        );
      })
    : users;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 className="adm-topbar-title">Users <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#94a3b8" }}>({filtered.length})</span></h1>
        <div className="adm-search-wrap">
          <Search size={15} className="adm-search-icon" />
          <input
            className="adm-search-input"
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>User</th>
                <th className="col-hide-mobile">Country</th>
                <th>Plan</th>
                <th className="col-hide-mobile">Last Model</th>
                <th>Credits</th>
                <th className="col-hide-mobile">Projects</th>
                <th className="col-hide-mobile">Joined</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.clerkId}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-user-avatar">
                        {u.imageUrl
                          ? <img src={u.imageUrl} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                          : <span>{u.name?.[0] ?? "?"}</span>}
                      </div>
                      <div>
                        <p className="adm-user-name">{u.name}</p>
                        <p className="adm-user-email">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="col-hide-mobile">
                    {u.country ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://flagcdn.com/w20/${u.country.toLowerCase()}.png`}
                          width={20} height={14} alt={u.country}
                          style={{ borderRadius: "2px", objectFit: "cover", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                          {(() => { try { return COUNTRY_NAMES.of(u.country); } catch { return u.country; } })()}
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.55rem", borderRadius: "999px", background: u.hasPurchased ? "#ede9fe" : "#f1f5f9", color: u.hasPurchased ? "#7c3aed" : "#64748b" }}>
                      {u.hasPurchased ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="col-hide-mobile">
                    {u.lastModel
                      ? <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#0f172a" }}>{u.lastModel}</span>
                      : <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>—</span>}
                  </td>
                  <td>
                    <input className="adm-credits-input" type="number" defaultValue={u.credits} />
                  </td>
                  <td className="col-hide-mobile">{projectCountByUser[u.clerkId] ?? 0}</td>
                  <td className="col-hide-mobile" style={{ color: "#94a3b8" }}>{u.createdAt}</td>
                  <td className="right" style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <Link href={`/secure-7x9/users/${u.clerkId}`} className="adm-action-link">View</Link>
                    <DeleteUserButton clerkId={u.clerkId} name={u.name ?? u.email} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
