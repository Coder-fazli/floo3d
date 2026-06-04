import "./blog.css";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Blog — MyHomeStyler",
  description: "Design tips, AI insights, and home styling inspiration from the MyHomeStyler team.",
  alternates: { canonical: "https://myhomestyler.com/blog" },
};

const LISTING_COPY: Record<string, { eyebrow: string; title: string; sub: string; empty: string; read: string; dateLocale: string }> = {
  en: { eyebrow: "The Journal", title: "Design Tips & AI Insights", sub: "Home styling inspiration, floor plan guides, and product updates from the MyHomeStyler team.", empty: "No posts published yet. Check back soon.", read: "Read", dateLocale: "en-US" },
  ar: { eyebrow: "المدونة", title: "نصائح التصميم ورؤى الذكاء الاصطناعي", sub: "إلهام لتنسيق المنزل، وأدلة مخططات الطوابق، وتحديثات المنتج من فريق MyHomeStyler.", empty: "لا توجد مقالات منشورة بعد. عُد قريباً.", read: "اقرأ", dateLocale: "ar-AE" },
  es: { eyebrow: "El Blog", title: "Consejos de Diseño e Ideas con IA", sub: "Inspiración para decorar tu hogar, guías de planos y novedades del producto del equipo de MyHomeStyler.", empty: "Aún no hay artículos publicados. Vuelve pronto.", read: "Leer", dateLocale: "es-ES" },
};

export default async function BlogPage() {
  const locale = await getLocale();
  const t = LISTING_COPY[locale] ?? LISTING_COPY.en;
  const localePrefix = locale === "ar" ? "/ar" : locale === "es" ? "/es" : "";
  const postLocaleFilter =
    locale === "ar" ? "ar" :
    locale === "es" ? "es" :
    { $in: ["en", null, undefined] };

  await connectDb();
  const posts = await Post.find({ status: "published", locale: postLocaleFilter })
    .sort({ createdAt: -1 })
    .select("title slug excerpt coverImage tags createdAt")
    .lean() as any[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MyHomeStyler Blog",
    description: "Design tips, AI insights, and home styling inspiration.",
    url: "https://myhomestyler.com/blog",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://myhomestyler.com${localePrefix}/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <div className="blog-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <div className="blog-list-hero">
        <p className="blog-list-eyebrow">{t.eyebrow}</p>
        <h1 className="blog-list-title">{t.title}</h1>
        <p className="blog-list-sub">{t.sub}</p>
      </div>

      {/* Grid */}
      <div className="blog-list-inner">
        {posts.length === 0 ? (
          <div className="blog-empty">
            <FileText size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.25 }} />
            <p>{t.empty}</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <Link href={`${localePrefix}/${post.slug}`} key={post._id?.toString()} className="blog-card">
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
                      {new Date(post.createdAt).toLocaleDateString(t.dateLocale, {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                    <span className="blog-card-read">
                      {t.read} <ArrowRight size={12} />
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
