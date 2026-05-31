import "../../blog/blog.css";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const BACK_LABEL: Record<string, string> = {
  en: "Back to Blog",
  ar: "العودة إلى المدونة",
};
const HOME_LABEL: Record<string, string> = {
  en: "Home",
  ar: "الرئيسية",
};
const BLOG_LABEL: Record<string, string> = {
  en: "Blog",
  ar: "المدونة",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  await connectDb();
  const post = await Post.findOne({ slug, status: "published" }).lean() as any;
  if (!post) return {};

  const base = "https://myhomestyler.com";
  const url = locale === "ar" ? `${base}/ar/${slug}` : `${base}/${slug}`;
  const enUrl = `${base}/${slug}`;
  const arUrl = `${base}/ar/${slug}`;

  const seoTitle = post.metaTitle || post.title + " — MyHomeStyler Blog";
  const seoDesc = post.metaDescription || post.excerpt || post.title;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: url,
      languages: {
        en: enUrl,
        "ar-AE": arUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url,
      type: "article",
      locale: locale === "ar" ? "ar_AE" : "en_US",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  await connectDb();
  const post = await Post.findOne({ slug, status: "published" }).lean() as any;
  if (!post) notFound();

  const dateLocale = locale === "ar" ? "ar-AE" : "en-US";
  const date = new Date(post.createdAt).toLocaleDateString(dateLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const blogHref = locale === "ar" ? "/ar/blog" : "/blog";
  const homeHref = locale === "ar" ? "/ar" : "/";

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
    url: locale === "ar"
      ? `https://myhomestyler.com/ar/${slug}`
      : `https://myhomestyler.com/${slug}`,
    inLanguage: locale === "ar" ? "ar-AE" : "en-US",
    keywords: post.tags?.join(", ") ?? "",
  };

  return (
    <div className="post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <header className="post-header">
        <div className="post-header-left">
          <nav className="post-breadcrumb">
            <Link href={homeHref}>{HOME_LABEL[locale] ?? "Home"}</Link>
            <span className="post-breadcrumb-sep">›</span>
            <Link href={blogHref}>{BLOG_LABEL[locale] ?? "Blog"}</Link>
            <span className="post-breadcrumb-sep">›</span>
            <span className="post-breadcrumb-current">{post.title}</span>
          </nav>

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

          <h1 className="post-title">{post.title}</h1>
          {post.excerpt && <p className="post-excerpt-lead">{post.excerpt}</p>}

          <div className="post-author">
            <div className="post-author-avatar">M</div>
            <div>
              <p className="post-author-name">MyHomeStyler Team</p>
              <p className="post-author-role">Design & AI Insights</p>
            </div>
          </div>
        </div>

        {post.coverImage && (
          <div className="post-header-img-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="post-header-img" />
          </div>
        )}
      </header>

      <section className="post-body-section">
        <div className="post-body-wrap">
          <Link href={blogHref} className="post-back">
            <ArrowLeft size={14} /> {BACK_LABEL[locale] ?? "Back to Blog"}
          </Link>

          <article
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
          />

          {post.tags?.length > 0 && (
            <div className="post-tags-footer">
              {post.tags.map((t: string) => (
                <span key={t} className="post-tag-footer">{t}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
