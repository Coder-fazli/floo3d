import "../../blog/blog.css";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { localizedUrl } from "@/lib/seo";

const BACK_LABEL: Record<string, string> = {
  en: "Back to Blog",
  ar: "العودة إلى المدونة",
  es: "Volver al Blog",
};
const HOME_LABEL: Record<string, string> = {
  en: "Home",
  ar: "الرئيسية",
  es: "Inicio",
};
const BLOG_LABEL: Record<string, string> = {
  en: "Blog",
  ar: "المدونة",
  es: "Blog",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  await connectDb();
  const post = await Post.findOne({ slug, status: "published" }).lean() as any;
  if (!post) return {};

  // Canonical follows the post's OWN locale, not the URL it was reached by.
  // This consolidates /slug and /ar/slug (both resolve the same post) onto one URL.
  const postLocale = post.locale === "ar" ? "ar" : post.locale === "es" ? "es" : "en";
  const url = localizedUrl(`/${slug}`, postLocale);

  const seoTitle = post.metaTitle || post.title + " — MyHomeStyler Blog";
  const seoDesc = post.metaDescription || post.excerpt || post.title;

  return {
    title: seoTitle,
    description: seoDesc,
    // No cross-locale hreflang: posts are independent (no en↔ar translation pairs).
    alternates: { canonical: url },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url,
      type: "article",
      locale: postLocale === "ar" ? "ar_AE" : postLocale === "es" ? "es_ES" : "en_US",
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

  // Use the post's own locale for canonical URL + schema; URL locale only for date display.
  const postLocale = post.locale === "ar" ? "ar" : post.locale === "es" ? "es" : "en";
  const dateLocale = locale === "ar" ? "ar-AE" : locale === "es" ? "es-ES" : "en-US";
  const date = new Date(post.createdAt).toLocaleDateString(dateLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const blogHref = "/blog";
  const homeHref = "/";

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
    url: localizedUrl(`/${slug}`, postLocale),
    inLanguage: postLocale === "ar" ? "ar-AE" : postLocale === "es" ? "es-ES" : "en-US",
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
