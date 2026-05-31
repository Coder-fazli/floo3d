import "../home.css";
import MainHero from "@/components/MainHero";
import DesignOptions from "@/components/DesignOptions";
import HowItWorks2 from "@/components/HowItWorks2";
import StatsBar from "@/components/StatsBar";
import BlogsSection from "@/components/ui/blogs";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import ProductShowcase from "@/components/ProductShowcase";
import { getHomeImages } from "@/lib/actions";
import { connectDb } from "@/lib/db";
import Post from "@/lib/models/Posts";
const reviews = [
  { name: "David M.", handle: "@davidm", avatar: "/avatars/av1.jpg", text: "I rendered my entire apartment floor plan in under 2 minutes. The 3D output is stunning, clients love it." },
  { name: "Jessica K.", handle: "@jessicak", avatar: "/avatars/av2.jpg", text: "As an architect, this saves me hours. The AI understands spatial layout better than I expected." },
  { name: "Sophie R.", handle: "@sophier", avatar: "/avatars/av3.jpg", text: "Used it for my renovation project. Before and after comparison slider is a killer feature." },
  { name: "Omar T.", handle: "@omart", avatar: "/avatars/av4.jpg", text: "Finally a tool that makes floor plans look like real renders. My agency uses this daily now." },
  { name: "Priya S.", handle: "@priyas", avatar: "/avatars/av5.jpg", text: "Super fast, super clean. I shared the link with my client and they approved the design instantly." },
  { name: "Chris L.", handle: "@chrisl", avatar: "/avatars/av6.jpg", text: "The quality blew me away. Looks like a proper architectural visualization tool but way simpler." },
  { name: "Marcus F.", handle: "@marcusf", avatar: "/avatars/av7.jpg", text: "I'm not even a designer and I managed to get a beautiful 3D render from my hand-drawn sketch." },
  { name: "Dev P.", handle: "@devp", avatar: "/avatars/av8.jpg", text: "Best AI tool I've used this year. The export quality is perfect for client presentations." },
];

function buildJsonLd(locale: string) {
  const isAr = locale === 'ar';
  const baseUrl = isAr ? 'https://myhomestyler.com/ar' : 'https://myhomestyler.com';
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": isAr ? "MyHomeStyler — أداة تصميم الديكور الداخلي ومخططات الطوابق بالذكاء الاصطناعي" : "MyHomeStyler — AI Interior Design & Floor Plan Tool",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web",
        "url": baseUrl,
        "inLanguage": isAr ? "ar-AE" : "en-US",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": isAr ? "AED" : "USD",
          "description": isAr ? "مجاني للبدء — لا حاجة لبطاقة ائتمان" : "Free to start — no credit card required",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "2547",
          "bestRating": "5",
          "worstRating": "1",
        },
        "review": reviews.map((r) => ({
          "@type": "Review",
          "author": { "@type": "Person", "name": r.name },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": r.text,
        })),
        "description": isAr
          ? "أداة ذكاء اصطناعي لتصميم الديكور الداخلي ومخططات الطوابق. حوّل المخططات ثنائية الأبعاد إلى تصورات ثلاثية الأبعاد فوتوغرافية على الفور."
          : "AI-powered interior design and floor plan visualization tool. Transform 2D floor plans into photorealistic 3D renders instantly.",
        "screenshot": "https://myhomestyler.com/og-image.png",
      },
      {
        "@type": "FAQPage",
        "inLanguage": isAr ? "ar-AE" : "en-US",
        "mainEntity": isAr ? [
          { "@type": "Question", "name": "ما هو MyHomeStyler؟", "acceptedAnswer": { "@type": "Answer", "text": "MyHomeStyler أداة ذكاء اصطناعي تحوّل مخططات الطوابق وصور الديكور الداخلي إلى تصورات ثلاثية الأبعاد فوتوغرافية على الفور." } },
          { "@type": "Question", "name": "هل MyHomeStyler مجاني؟", "acceptedAnswer": { "@type": "Answer", "text": "نعم. يمكنك البدء مجاناً دون الحاجة إلى بطاقة ائتمان. يحصل كل حساب جديد على رصيدين مجانيين." } },
          { "@type": "Question", "name": "ما الذي يمكنني فعله بـ MyHomeStyler؟", "acceptedAnswer": { "@type": "Answer", "text": "يمكنك تحويل المخططات ثنائية الأبعاد إلى تصورات ثلاثية الأبعاد، وإعادة تصميم الغرف، وتصور المساحات الخارجية." } },
          { "@type": "Question", "name": "كم يستغرق إنشاء التصور؟", "acceptedAnswer": { "@type": "Answer", "text": "معظم التصورات تُنشأ في 15–30 ثانية." } },
        ] : [
          { "@type": "Question", "name": "What is MyHomeStyler?", "acceptedAnswer": { "@type": "Answer", "text": "MyHomeStyler is an AI-powered tool that transforms 2D floor plans and interior photos into photorealistic 3D renders instantly." } },
          { "@type": "Question", "name": "Is MyHomeStyler free to use?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can start for free with no credit card required. Free users get credits to try the tool immediately after signing up." } },
          { "@type": "Question", "name": "What can I do with MyHomeStyler?", "acceptedAnswer": { "@type": "Answer", "text": "You can convert 2D floor plans to 3D renders, redesign interior rooms, visualize outdoor spaces, and empty rooms." } },
          { "@type": "Question", "name": "How long does it take to generate a render?", "acceptedAnswer": { "@type": "Answer", "text": "Most renders are generated in 15–30 seconds. You'll see a live progress indicator while the AI is working." } },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": isAr ? "الرئيسية" : "Home", "item": baseUrl },
        ],
      },
    ],
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const homeImages = await getHomeImages();
  await connectDb();
  const rawPosts = await Post.find({ status: "published", locale: locale === "ar" ? "ar" : { $in: ["en", null, undefined] } })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("title slug excerpt coverImage tags createdAt locale")
    .lean() as any[];
  const dateLocale = locale === 'ar' ? 'ar-AE' : 'en-US';
  const blogPosts = rawPosts.map((p) => ({
    title: p.title,
    description: p.excerpt ?? "",
    image: p.coverImage ?? null,
    publishDate: new Date(p.createdAt).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" }),
    readMoreLink: locale === 'ar' ? `/ar/${p.slug}` : `/${p.slug}`,
    category: p.tags?.[0]?.toUpperCase() ?? "BLOG",
  }));
  return (
    <div className="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }}
      />
      <MainHero heroBeforeUrl={homeImages.heroBeforeUrl} heroAfterUrl={homeImages.heroAfterUrl} />

      <ProductShowcase />

      <DesignOptions transformImages={homeImages.transformImages} />

      <HowItWorks2 />
      <StatsBar />

      <RecentProjects />

      <TestimonialsMarquee />

      <BlogsSection posts={blogPosts} />

      <FAQ twoColumns />

      <Footer />
    </div>
  );
}
