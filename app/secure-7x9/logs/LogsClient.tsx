"use client";
import "./logs.css";
import { useState } from "react";

const INPUT_TYPE_LABELS: Record<string, string> = {
  "floor-plan":           "Floor Plan",
  "interior-design":      "Interior Design",
  "outdoor":              "Outdoor",
  "empty-room":           "Empty Room",
  "floor-plan-generator": "Floor Plan Gen",
  "isometric":            "Isometric",
};

const MODEL_LABELS: Record<string, string> = {
  "gemini-3-pro-image-preview":     "Gemini 3 Pro",
  "gemini-3.1-flash-image-preview": "Gemini 3.1 Flash",
  "gemini-2.5-flash-image":         "Gemini 2.5 Flash",
};

function formatDuration(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function LogsClient({ logs }: { logs: any[] }) {
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");
  const [inputFilter, setInputFilter] = useState("all");

  const filtered = logs.filter(l => {
    if (filter !== "all" && l.status !== filter) return false;
    if (inputFilter !== "all" && l.inputType !== inputFilter) return false;
    return true;
  });

  const successCount = logs.filter(l => l.status === "success").length;
  const errorCount   = logs.filter(l => l.status === "error").length;

  return (
    <div className="adm-content">
      <h1 className="adm-topbar-title" style={{ marginBottom: "0.5rem" }}>Generation Logs</h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem" }}>
        Last 500 generations — success and errors.
      </p>

      {/* Stats row */}
      <div className="logs-stats">
        <div className="logs-stat">
          <span className="logs-stat-value">{logs.length}</span>
          <span className="logs-stat-label">Total</span>
        </div>
        <div className="logs-stat logs-stat-success">
          <span className="logs-stat-value">{successCount}</span>
          <span className="logs-stat-label">Success</span>
        </div>
        <div className="logs-stat logs-stat-error">
          <span className="logs-stat-value">{errorCount}</span>
          <span className="logs-stat-label">Errors</span>
        </div>
        <div className="logs-stat">
          <span className="logs-stat-value">
            {logs.length ? `${((successCount / logs.length) * 100).toFixed(1)}%` : "—"}
          </span>
          <span className="logs-stat-label">Success rate</span>
        </div>
      </div>

      {/* Filters */}
      <div className="logs-filters">
        <div className="logs-filter-group">
          {(["all", "success", "error"] as const).map(f => (
            <button
              key={f}
              className={`logs-filter-btn${filter === f ? " logs-filter-btn-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          className="logs-select"
          value={inputFilter}
          onChange={e => setInputFilter(e.target.value)}
        >
          <option value="all">All input types</option>
          {Object.entries(INPUT_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="adm-card logs-table-wrap">
        {filtered.length === 0 ? (
          <p className="logs-empty">No logs found.</p>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Input Type</th>
                <th>Model</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log: any) => (
                <tr key={log._id} className={log.status === "error" ? "logs-row-error" : ""}>
                  <td className="logs-td-date">{formatDate(log.createdAt)}</td>
                  <td>{INPUT_TYPE_LABELS[log.inputType] ?? log.inputType}</td>
                  <td className="logs-td-model">{MODEL_LABELS[log.model] ?? log.model}</td>
                  <td className="logs-td-dur">{formatDuration(log.duration)}</td>
                  <td>
                    <span className={`logs-badge logs-badge-${log.status}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="logs-td-err">{log.errorMessage ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
