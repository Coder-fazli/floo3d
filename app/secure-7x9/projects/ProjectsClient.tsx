"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, AlertCircle, CheckCircle2, Clock, Zap, Download, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

const INPUT_TABS = [
  { key: "all", label: "All" },
  { key: "floor-plan", label: "Floor Plan" },
  { key: "interior-design", label: "Interior" },
  { key: "outdoor", label: "Garden & Yard" },
  { key: "empty-room", label: "Empty Room" },
];

const STATUS_OPTS = [
  { key: "all", label: "All" },
  { key: "done", label: "Done" },
  { key: "pending", label: "Pending" },
  { key: "error", label: "Error" },
];

const SORT_OPTS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
];

function StatusBadge({ project }: { project: any }) {
  if (project.status === "error") {
    return (
      <span
        className="adm-badge adm-badge-red"
        title={project.errorMessage || "Generation failed"}
        style={{ cursor: "help", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
      >
        <AlertCircle size={10} />
        Error
      </span>
    );
  }
  if (project.status === "done" && project.renderedImageUrl) {
    return (
      <span className="adm-badge adm-badge-green" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
        <CheckCircle2 size={10} />
        Done
      </span>
    );
  }
  return (
    <span className="adm-badge adm-badge-orange" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
      <Clock size={10} />
      Pending
    </span>
  );
}

export default function ProjectsClient({ projects }: { projects: any[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (activeTab !== "all") list = list.filter((p) => p.inputType === activeTab);
    if (statusFilter !== "all") {
      if (statusFilter === "done") list = list.filter((p) => p.status === "done" && p.renderedImageUrl);
      else if (statusFilter === "error") list = list.filter((p) => p.status === "error");
      else list = list.filter((p) => p.status === "pending" || (!p.renderedImageUrl && p.status !== "error"));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.userName?.toLowerCase().includes(q) ||
          p.userEmail?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
    return list;
  }, [projects, activeTab, statusFilter, sortOrder, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    for (const p of projects) counts[p.inputType] = (counts[p.inputType] ?? 0) + 1;
    return counts;
  }, [projects]);

  const errorCount = projects.filter((p) => p.status === "error").length;

  function handleTabChange(key: string) { setActiveTab(key); setPage(1); }
  function handleStatusChange(key: string) { setStatusFilter(key); setPage(1); }
  function handleSearch(v: string) { setSearch(v); setPage(1); }

  return (
    <div className="adm-content" style={{ minWidth: 0 }}>

      {/* Header */}
      <div className="proj-header">
        <div>
          <h1 className="adm-topbar-title" style={{ marginBottom: "0.25rem" }}>Projects</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
            {projects.length} total &nbsp;·&nbsp;
            <span style={{ color: "#16a34a", fontWeight: 600 }}>{projects.filter((p) => p.status === "done").length} completed</span>
            {errorCount > 0 && (
              <>&nbsp;·&nbsp;<span style={{ color: "#dc2626", fontWeight: 600 }}>{errorCount} errors</span></>
            )}
          </p>
        </div>
        <div className="adm-search-wrap">
          <Search size={15} className="adm-search-icon" />
          <input
            className="adm-search-input proj-search"
            type="text"
            placeholder="Search project or user..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-filter-tabs" style={{ overflowX: "auto", flexWrap: "nowrap" }}>
        {INPUT_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`adm-filter-tab${activeTab === tab.key ? " adm-filter-tab-active" : ""}`}
            onClick={() => handleTabChange(tab.key)}
            style={{ whiteSpace: "nowrap" }}
          >
            {tab.label}
            <span style={{
              marginLeft: "0.4rem",
              fontSize: "0.65rem",
              fontWeight: 700,
              background: activeTab === tab.key ? "rgba(236,91,19,0.1)" : "#f1f5f9",
              color: activeTab === tab.key ? "#ec5b13" : "#94a3b8",
              borderRadius: "9999px",
              padding: "0.1rem 0.45rem",
            }}>
              {tabCounts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="proj-filters">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {STATUS_OPTS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleStatusChange(opt.key)}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: statusFilter === opt.key ? "#ec5b13" : "#e2e8f0",
                background: statusFilter === opt.key ? "rgba(236,91,19,0.06)" : "#ffffff",
                color: statusFilter === opt.key ? "#ec5b13" : "#64748b",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={sortOrder}
          onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
          style={{
            padding: "0.4rem 0.75rem",
            border: "1px solid #e2e8f0",
            borderRadius: "0.625rem",
            fontSize: "0.8rem",
            fontFamily: "inherit",
            color: "#334155",
            background: "#f8fafc",
            outline: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {SORT_OPTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as any}>
          <table className="adm-table" style={{ minWidth: "700px" }}>
            <thead>
              <tr>
                <th>Project</th>
                <th>User</th>
                <th>Type / Style</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    <Zap size={11} /> Gens
                  </span>
                </th>
                <th style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    <Download size={11} /> DL
                  </span>
                </th>
                <th>Created</th>
                <th className="right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: "3rem" }}>
                    No projects found
                  </td>
                </tr>
              ) : (
                paginated.map((p: any) => (
                  <tr key={p._id} style={p.status === "error" ? { background: "#fff8f8" } : {}}>
                    {/* Project */}
                    <td>
                      <div className="adm-project-cell">
                        <div className="adm-thumb">
                          {p.originalImageUrl && <img src={p.originalImageUrl} alt="" />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", maxWidth: "10rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name || "Untitled"}
                          </p>
                          <p style={{ margin: 0, fontSize: "0.65rem", color: "#cbd5e1", fontFamily: "monospace" }}>{p._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>

                    {/* User */}
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-user-avatar">{p.userName?.[0]?.toUpperCase() ?? "?"}</div>
                        <div style={{ minWidth: 0 }}>
                          <p className="adm-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "8rem" }}>{p.userName || "—"}</p>
                          <p className="adm-user-email" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "8rem" }}>{p.userEmail || "—"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type / Style */}
                    <td>
                      <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#334155", whiteSpace: "nowrap" }}>{p.inputType || "—"}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{p.renderStyle || "—"}</p>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge project={p} />
                      {p.status === "error" && p.errorMessage && (
                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.7rem", color: "#dc2626", maxWidth: "14rem", wordBreak: "break-word" }} title={p.errorMessage}>
                          {p.errorMessage}
                        </p>
                      )}
                    </td>

                    {/* Generations */}
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontWeight: 700, color: p.generationCount > 0 ? "#0f172a" : "#94a3b8" }}>
                        {p.generationCount ?? 0}
                      </span>
                    </td>

                    {/* Downloaded */}
                    <td style={{ textAlign: "center" }}>
                      {p.downloadedAt ? (
                        <span title={new Date(p.downloadedAt).toLocaleString()} style={{ color: "#16a34a" }}>
                          <Download size={14} />
                        </span>
                      ) : (
                        <span style={{ color: "#cbd5e1" }}>—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Action */}
                    <td className="right">
                      <Link href={`/visualizer/${p._id}`} className="adm-action-link">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="proj-pagination">
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="proj-page-btn"
                style={{ opacity: page === 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | "...")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, idx) =>
                  n === "..." ? (
                    <span key={`e-${idx}`} style={{ padding: "0 0.25rem", color: "#94a3b8", fontSize: "0.8rem" }}>…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className="proj-page-btn"
                      style={{
                        borderColor: page === n ? "#ec5b13" : "#e2e8f0",
                        background: page === n ? "rgba(236,91,19,0.08)" : "#fff",
                        color: page === n ? "#ec5b13" : "#334155",
                        fontWeight: page === n ? 700 : 500,
                      }}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="proj-page-btn"
                style={{ opacity: page === totalPages ? 0.4 : 1 }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
