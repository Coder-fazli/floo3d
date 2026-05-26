import "./blog.css";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export const metadata = {
  title: "Blog — MyHomeStyler",
  description: "Design tips, AI insights, and home styling inspiration from the MyHomeStyler team.",
};

export default async function BlogPage() {
  await connectDb();
  const posts = await Post.find({ status: "published" })
    .sort({ createdAt: -1 })
    .select("title slug excerpt coverImage tags createdAt")
    .lean() as any[];

  return (
    <div className="blog-page">
      <Navbar />

      {/* Hero */}
      <div className="blog-list-hero">
        <p className="blog-list-eyebrow">The Journal</p>
        <h1 className="blog-list-title">Design Tips & AI Insights</h1>
        <p className="blog-list-sub">Home styling inspiration, floor plan guides, and product updates from the MyHomeStyler team.</p>
      </div>

      {/* Grid */}
      <div className="blog-list-inner">
        {posts.length === 0 ? (
          <div className="blog-empty">
            <FileText size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.25 }} />
            <p>No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post._id?.toString()} className="blog-card">
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt={post.title} className="blog-card-img" />
                ) : (
                  <div className="blog-card-img-placeholder">
                    <FileText size={32} color="#ec5b13" style={{ opacity: 0.4 }} />
                  </div>
                )}
                <div className="blog-card-body">
                  {post.tags?.length > 0 && (
                    <div className="blog-card-tags">
                      {post.tags.slice(0, 2).map((t: string) => (
                        <span key={t} className="blog-card-tag">{t}</span>
                      ))}
                    </div>
                  )}
                  <h2 className="blog-card-title">{post.title}</h2>
                  {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                  <div className="blog-card-meta">
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                    <span className="blog-card-read">
                      Read <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
