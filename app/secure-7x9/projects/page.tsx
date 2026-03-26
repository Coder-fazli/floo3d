import Link from "next/link";
import { Eye } from "lucide-react";
import { getAllProjects } from "@/lib/actions";

export default async function AdminProjects() {
  const projects = await getAllProjects();

  return (
    <div className="adm-content">
      <h1 className="adm-topbar-title" style={{ marginBottom: "1.5rem" }}>Projects</h1>

      <div className="adm-card" style={{ overflow: "hidden" }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Created</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr><td colSpan={4} style={{ color: "#94a3b8", textAlign: "center" }}>No projects yet</td></tr>
            ) : (
              projects.map((p: any) => (
                <tr key={p._id}>
                  <td>
                    <div className="adm-project-cell">
                      <div className="adm-thumb" style={{ width: "2.5rem", height: "2.5rem" }}>
                        {p.originalImageUrl && <img src={p.originalImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.375rem" }} />}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.name || "Untitled"}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`adm-badge ${p.renderedImageUrl ? "adm-badge-green" : "adm-badge-orange"}`}>
                      {p.renderedImageUrl ? "Completed" : "Processing"}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="right">
                    <Link href={`/visualizer/${p._id}`} className="adm-action-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
