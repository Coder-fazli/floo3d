"use client";

import "../dashboard/dashboard.css";
import AppSidebar from "@/components/AppSidebar";
import ProjectModal from "@/components/ProjectModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getProjects } from "@/lib/actions";
import { Calendar, ArrowLeft, Maximize2 } from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "recent">("all");
  const [visible, setVisible] = useState(24);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && !user) router.push("/");
  }, [isLoaded, user]);

  useEffect(() => {
    if (user) getProjects(user.id).then(setProjects);
  }, [user?.id]);

  useEffect(() => {
    if (selectedIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIdx(null);
      if (e.key === "ArrowLeft") setSelectedIdx(i => (i !== null && i > 0) ? i - 1 : i);
      if (e.key === "ArrowRight") setSelectedIdx(i => (i !== null && i! < displayed.length - 1) ? i! + 1 : i);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIdx]);

  if (!isLoaded || !user) return null;

  const sorted = filter === "recent"
    ? [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : projects;
  const displayed = sorted.slice(0, visible);
  const selected = selectedIdx !== null ? displayed[selectedIdx] ?? null : null;

  async function handleDelete() {
    if (!selected) return;
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${selected._id}`, { method: "DELETE" });
    setProjects(prev => prev.filter(p => p._id !== selected._id));
    setSelectedIdx(null);
  }

  return (
    <div className="db-page">
      <AppSidebar />

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
              <button className={`db-filter-tab${filter === "all" ? " db-filter-active" : ""}`} onClick={() => setFilter("all")}>All</button>
              <button className={`db-filter-tab${filter === "recent" ? " db-filter-active" : ""}`} onClick={() => setFilter("recent")}>Recent</button>
            </div>
          </div>

          {displayed.length === 0 ? (
            <div className="db-empty">No projects yet. Go to the dashboard to start your first render.</div>
          ) : (
            <div className="db-grid">
              {displayed.map(({ _id, name, renderedImageUrl, originalImageUrl, createdAt }, idx) => (
                <div key={_id} className="db-card" onClick={() => setSelectedIdx(idx)}>
                  <div className="db-card-img-wrap">
                    <img src={renderedImageUrl || originalImageUrl} alt={name || "Project"} className="db-card-img" />
                    <div className="db-card-overlay">
                      <button className="db-overlay-btn" onClick={e => { e.stopPropagation(); setSelectedIdx(idx); }}>
                        <Maximize2 size={15} />
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
              <button className="db-load-more-btn" onClick={() => setVisible(v => v + 24)}>Load More</button>
            </div>
          )}
        </section>
      </main>

      {selected && (
        <ProjectModal
          project={selected}
          onClose={() => setSelectedIdx(null)}
          onDelete={handleDelete}
          hasPrev={selectedIdx! > 0}
          hasNext={selectedIdx! < displayed.length - 1}
          onPrev={() => setSelectedIdx(i => i! - 1)}
          onNext={() => setSelectedIdx(i => i! + 1)}
        />
      )}
    </div>
  );
}
