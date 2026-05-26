import "../blog.css";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDb();
  const post = await Post.findOne({ slug, status: "published" }).lean() as any;
  if (!post) return {};
  const url = `https://myhomestyler.com/blog/${slug}`;
  return {
    title: post.title + " — MyHomeStyler Blog",
    description: post.excerpt || post.title,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function SinglePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDb();
  const post = await Post.findOne({ slug, status: "published" }).lean() as any;
  if (!post) notFound();

  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? "",
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt ?? post.createdAt).toISOString(),
    author: {
      "@type": "Organization",
      name: "MyHomeStyler Team",
      url: "https://myhomestyler.com",
    },
    publisher: {
      "@type": "Organization",
      name: "MyHomeStyler",
      url: "https://myhomestyler.com",
      logo: { "@type": "ImageObject", url: "https://myhomestyler.com/logo.png" },
    },
    url: `https://myhomestyler.com/blog/${post.slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://myhomestyler.com/blog/${post.slug}` },
    keywords: post.tags?.join(", ") ?? "",
  };

  return (
    <div className="post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Breadcrumb */}
      <nav className="post-breadcrumb">
        <Link href="/">Home</Link>
        <span className="post-breadcrumb-sep">›</span>
        <Link href="/blog">Blog</Link>
        <span className="post-breadcrumb-sep">›</span>
        <span className="post-breadcrumb-current">{post.title}</span>
      </nav>

      {/* Header — title left, image right */}
      <header className="post-header">
        <div className="post-header-left">
          {/* Tags + date */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.25rem" }}>
            {post.tags?.length > 0 && (
              <div className="post-header-tags">
                {post.tags.map((t: string) => (
                  <span key={t} className="post-header-tag">{t}</span>
                ))}
              </div>
            )}
            <span className="post-header-date">{date}</span>
          </div>

          {/* Title */}
          <h1 className="post-title">{post.title}</h1>

          {/* Excerpt lead */}
          {post.excerpt && <p className="post-excerpt-lead">{post.excerpt}</p>}

          {/* Author */}
          <div className="post-author">
            <div className="post-author-avatar">M</div>
            <div>
              <p className="post-author-name">MyHomeStyler Team</p>
              <p className="post-author-role">Design & AI Insights</p>
            </div>
          </div>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="post-header-img-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="post-header-img" />
          </div>
        )}
      </header>

      <div className="post-divider"><hr /></div>

      {/* Article body */}
      <div className="post-body-wrap">
        <Link href="/blog" className="post-back">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <article
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
        />

        {/* Tags footer */}
        {post.tags?.length > 0 && (
          <div className="post-tags-footer">
            {post.tags.map((t: string) => (
              <span key={t} className="post-tag-footer">{t}</span>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
