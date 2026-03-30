"use client";

import "../dashboard/dashboard.css";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getProjects } from "@/lib/actions";
import { Calendar, Eye, ArrowLeft } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "recent">("all");
  const [visible, setVisible] = useState(12);

  useEffect(() => {
    if (isLoaded && !user) router.push("/");
  }, [isLoaded, user]);

  useEffect(() => {
    if (user) getProjects(user.id).then(setProjects);
  }, [user]);

  if (!isLoaded || !user) return null;

  const sorted = filter === "recent"
    ? [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : projects;
  const displayed = sorted.slice(0, visible);

  return (
    <div className="db-page">
      <DashboardNavbar />

      <main className="db-main">

        <div className="db-welcome">
          <div>
            <button className="db-btn-ghost" style={{ marginBottom: "0.5rem" }} onClick={() => router.push("/dashboard")}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h2 className="db-welcome-title">My Studio</h2>
            <p className="db-welcome-sub">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
          </div>
        </div>

        <section className="db-projects">
          <div className="db-projects-head">
            <h3 className="db-projects-title">All Projects</h3>
            <div className="db-filter-tabs">
              <button
                className={`db-filter-tab ${filter === "all" ? "db-filter-active" : ""}`}
                onClick={() => setFilter("all")}
              >All</button>
              <button
                className={`db-filter-tab ${filter === "recent" ? "db-filter-active" : ""}`}
                onClick={() => setFilter("recent")}
              >Recent</button>
            </div>
          </div>

          {displayed.length === 0 ? (
            <div className="db-empty">No projects yet. Go to the dashboard to start your first render.</div>
          ) : (
            <div className="db-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              {displayed.map(({ _id, name, renderedImageUrl, originalImageUrl, createdAt }) => (
                <div key={_id} className="db-card" onClick={() => router.push(`/visualizer/${_id}`)}>
                  <div className="db-card-img-wrap">
                    <img
                      src={renderedImageUrl || originalImageUrl}
                      alt={name || "Project"}
                      className="db-card-img"
                    />
                    <div className="db-card-overlay">
                      <button className="db-overlay-btn" onClick={(e) => { e.stopPropagation(); router.push(`/visualizer/${_id}`); }}>
                        <Eye size={16} />
                      </button>
                    </div>
                    <span className={`db-badge ${renderedImageUrl ? "db-badge-done" : "db-badge-processing"}`}>
                      {renderedImageUrl ? "Completed" : "Processing"}
                    </span>
                  </div>
                  <div className="db-card-body">
                    <h4 className="db-card-name">{name}</h4>
                    <div className="db-card-meta">
                      <Calendar size={11} />
                      <span>{new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sorted.length > visible && (
            <div className="db-load-more">
              <button className="db-load-more-btn" onClick={() => setVisible(v => v + 12)}>
                Load More Projects
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
