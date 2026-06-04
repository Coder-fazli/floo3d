"use client";
import "./editor.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FileText, Eye, ExternalLink } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

export default function PostsListClient({ posts }: { posts: any[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [locale, setLocale] = useState<"en" | "ar" | "es">("en");
  const [deleting, setDeleting] = useState<string | null>(null);

  const byLocale = posts.filter((p) => (p.locale ?? "en") === locale);
  const filtered = filter === "all" ? byLocale : byLocale.filter((p) => p.status === filter);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  const enCount = posts.filter((p) => (p.locale ?? "en") === "en").length;
  const arCount = posts.filter((p) => p.locale === "ar").length;
  const esCount = posts.filter((p) => p.locale === "es").length;
  const publishedCount = byLocale.filter((p) => p.status === "published").length;
  const draftCount = byLocale.filter((p) => p.status === "draft").length;

  return (
    <div className="adm-content">
      {/* Header */}
      <div className="pe-list-header">
        <div>
          <h1 className="adm-topbar-title" style={{ marginBottom: "0.25rem" }}>Posts</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
            {byLocale.length} total &nbsp;·&nbsp;
            <span style={{ color: "#16a34a", fontWeight: 600 }}>{publishedCount} published</span>
            &nbsp;·&nbsp;
            <span style={{ color: "#64748b", fontWeight: 600 }}>{draftCount} drafts</span>
          </p>
        </div>
        <button className="adm-btn-primary" onClick={() => router.push(`/secure-7x9/posts/new?locale=${locale}`)}>
          <Plus size={14} /> New Post
        </button>
      </div>

      {/* Language tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {([["en", "🇬🇧 English", enCount], ["ar", "🇦🇪 Arabic", arCount], ["es", "🇪🇸 Spanish", esCount]] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setLocale(key)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "999px",
              border: locale === key ? "2px solid #fb3b01" : "2px solid #e2e8f0",
              background: locale === key ? "rgba(251,59,1,0.06)" : "#fff",
              color: locale === key ? "#fb3b01" : "#64748b",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {label}
            <span style={{
              background: locale === key ? "rgba(251,59,1,0.12)" : "#f1f5f9",
              color: locale === key ? "#fb3b01" : "#94a3b8",
              borderRadius: "999px",
              padding: "0.05rem 0.45rem",
              fontSize: "0.65rem",
              fontWeight: 700,
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="pe-list-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`pe-filter-btn${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span style={{
              marginLeft: "0.35rem",
              fontSize: "0.65rem",
              fontWeight: 700,
              background: filter === f.key ? "rgba(236,91,19,0.1)" : "#f1f5f9",
              color: filter === f.key ? "#ec5b13" : "#94a3b8",
              borderRadius: "9999px",
              padding: "0.1rem 0.45rem",
            }}>
              {f.key === "all" ? byLocale.length : byLocale.filter((p) => p.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="adm-card" style={{ overflow: "hidden", padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
            <FileText size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: "0.875rem" }}>No posts yet</p>
            <button
              className="adm-btn-primary"
              style={{ marginTop: "1rem" }}
              onClick={() => router.push("/secure-7x9/posts/new")}
            >
              <Plus size={13} /> Write your first post
            </button>
          </div>
        ) : (
          filtered.map((post) => (
            <div key={post._id} className="pe-post-row">
              {/* Cover */}
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImage} alt="" className="pe-post-cover" />
              ) : (
                <div className="pe-post-cover-placeholder">
                  <FileText size={16} color="#cbd5e1" />
                </div>
              )}

              {/* Info */}
              <div className="pe-post-info">
                <p className="pe-post-info-title">{post.title || "Untitled"}</p>
                <p className="pe-post-info-meta">
                  /{post.slug} &nbsp;·&nbsp;{" "}
                  {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {post.tags?.length > 0 && (
                    <>&nbsp;·&nbsp;{post.tags.slice(0, 3).join(", ")}</>
                  )}
                </p>
              </div>

              {/* Status badge */}
              <span className={`pe-status-badge ${post.status === "published" ? "pe-status-published" : "pe-status-draft"}`}>
                {post.status === "published" ? <Eye size={9} /> : <FileText size={9} />}
                {post.status}
              </span>

              {/* Actions */}
              <div className="pe-post-actions">
                <a
                  className="pe-icon-btn"
                  title="Open post"
                  href={post.locale === "ar" ? `/ar/${post.slug}` : `/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  className="pe-icon-btn"
                  title="Edit"
                  onClick={() => router.push(`/secure-7x9/posts/${post._id}/edit`)}
                >
                  <Pencil size={13} />
                </button>
                <button
                  className="pe-icon-btn danger"
                  title="Delete"
                  disabled={deleting === post._id}
                  onClick={() => handleDelete(post._id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
