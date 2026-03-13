import { Plus, Pencil, Trash2 } from "lucide-react";

const MOCK_POSTS = [
  { id: "1", title: "Top 5 Trends in 3D Architectural Visualization", slug: "/blog/top-5-trends-2024", status: "published", date: "Nov 10, 2023" },
  { id: "2", title: "How AI is Changing Floor Plan Design", slug: "/blog/ai-floor-plan-design", status: "published", date: "Oct 28, 2023" },
  { id: "3", title: "Getting Started with Floo3D", slug: "/blog/getting-started", status: "draft", date: "Oct 15, 2023" },
];

export default function AdminPosts() {
  return (
    <div className="adm-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 className="adm-topbar-title">Posts</h1>
        <button className="adm-btn-primary">
          <Plus size={15} /> New Post
        </button>
      </div>

      <div className="adm-card" style={{ overflow: "hidden" }}>
        {MOCK_POSTS.map((post) => (
          <div key={post.id} className="adm-post-item">
            <div>
              <p className="adm-post-title">{post.title}</p>
              <p className="adm-post-meta">{post.slug} • {post.status === "published" ? "Published on" : "Draft •"} {post.date}</p>
            </div>
            <div className="adm-post-actions">
              <span className={`adm-badge ${post.status === "published" ? "adm-badge-green" : "adm-badge-gray"}`}>
                {post.status}
              </span>
              <button className="adm-icon-btn"><Pencil size={15} /></button>
              <button className="adm-icon-btn adm-icon-btn-danger"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
