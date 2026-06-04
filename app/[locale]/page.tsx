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

const JSONLD_COPY = {
  en: {
    inLanguage: "en-US", currency: "USD", baseUrl: "https://myhomestyler.com", home: "Home",
    appName: "MyHomeStyler — AI Interior Design & Floor Plan Tool",
    offerDesc: "Free to start — no credit card required",
    appDesc: "AI-powered interior design and floor plan visualization tool. Transform 2D floor plans into photorealistic 3D renders instantly.",
    faqs: [
      { q: "What is MyHomeStyler?", a: "MyHomeStyler is an AI-powered tool that transforms 2D floor plans and interior photos into photorealistic 3D renders instantly." },
      { q: "Is MyHomeStyler free to use?", a: "Yes. You can start for free with no credit card required. Free users get credits to try the tool immediately after signing up." },
      { q: "What can I do with MyHomeStyler?", a: "You can convert 2D floor plans to 3D renders, redesign interior rooms, visualize outdoor spaces, and empty rooms." },
      { q: "How long does it take to generate a render?", a: "Most renders are generated in 15–30 seconds. You'll see a live progress indicator while the AI is working." },
    ],
  },
  ar: {
    inLanguage: "ar-AE", currency: "AED", baseUrl: "https://myhomestyler.com/ar", home: "الرئيسية",
    appName: "MyHomeStyler — أداة تصميم الديكور الداخلي ومخططات الطوابق بالذكاء الاصطناعي",
    offerDesc: "مجاني للبدء — لا حاجة لبطاقة ائتمان",
    appDesc: "أداة ذكاء اصطناعي لتصميم الديكور الداخلي ومخططات الطوابق. حوّل المخططات ثنائية الأبعاد إلى تصورات ثلاثية الأبعاد فوتوغرافية على الفور.",
    faqs: [
      { q: "ما هو MyHomeStyler؟", a: "MyHomeStyler أداة ذكاء اصطناعي تحوّل مخططات الطوابق وصور الديكور الداخلي إلى تصورات ثلاثية الأبعاد فوتوغرافية على الفور." },
      { q: "هل MyHomeStyler مجاني؟", a: "نعم. يمكنك البدء مجاناً دون الحاجة إلى بطاقة ائتمان. يحصل كل حساب جديد على رصيدين مجانيين." },
      { q: "ما الذي يمكنني فعله بـ MyHomeStyler؟", a: "يمكنك تحويل المخططات ثنائية الأبعاد إلى تصورات ثلاثية الأبعاد، وإعادة تصميم الغرف، وتصور المساحات الخارجية." },
      { q: "كم يستغرق إنشاء التصور؟", a: "معظم التصورات تُنشأ في 15–30 ثانية." },
    ],
  },
  es: {
    inLanguage: "es-ES", currency: "EUR", baseUrl: "https://myhomestyler.com/es", home: "Inicio",
    appName: "MyHomeStyler — Diseño de Interiores y Planos con IA",
    offerDesc: "Gratis para empezar — sin tarjeta de crédito",
    appDesc: "Herramienta de IA para diseño de interiores y visualización de planos. Convierte planos 2D en renders 3D fotorrealistas al instante.",
    faqs: [
      { q: "¿Qué es MyHomeStyler?", a: "MyHomeStyler es una herramienta con IA que convierte planos 2D y fotos de interiores en renders 3D fotorrealistas al instante." },
      { q: "¿Es MyHomeStyler gratis?", a: "Sí. Puedes empezar gratis sin tarjeta de crédito. Cada cuenta nueva recibe créditos gratis para probar la herramienta justo después de registrarse." },
      { q: "¿Qué puedo hacer con MyHomeStyler?", a: "Puedes convertir planos 2D en renders 3D, rediseñar habitaciones, visualizar espacios exteriores y vaciar habitaciones." },
      { q: "¿Cuánto tarda en generarse un render?", a: "La mayoría de los renders se generan en 15–30 segundos. Verás un indicador de progreso en directo mientras la IA trabaja." },
    ],
  },
} as const;

function buildJsonLd(locale: string) {
  const c = JSONLD_COPY[(locale as keyof typeof JSONLD_COPY)] ?? JSONLD_COPY.en;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": c.appName,
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web",
        "url": c.baseUrl,
        "inLanguage": c.inLanguage,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": c.currency,
          "description": c.offerDesc,
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
        "description": c.appDesc,
        "screenshot": "https://myhomestyler.com/og-image.png",
      },
      {
        "@type": "FAQPage",
        "inLanguage": c.inLanguage,
        "mainEntity": c.faqs.map((f) => ({
          "@type": "Question", "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": c.home, "item": c.baseUrl },
        ],
      },
    ],
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const homeImages = await getHomeImages();
  await connectDb();
  const postLocaleFilter =
    locale === "ar" ? "ar" :
    locale === "es" ? "es" :
    { $in: ["en", null, undefined] };
  const rawPosts = await Post.find({ status: "published", locale: postLocaleFilter })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("title slug excerpt coverImage tags createdAt locale")
    .lean() as any[];
  const dateLocale = locale === 'ar' ? 'ar-AE' : locale === 'es' ? 'es-ES' : 'en-US';
  const localePrefix = locale === 'ar' ? '/ar' : locale === 'es' ? '/es' : '';
  const blogPosts = rawPosts.map((p) => ({
    title: p.title,
    description: p.excerpt ?? "",
    image: p.coverImage ?? null,
    publishDate: new Date(p.createdAt).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" }),
    readMoreLink: `${localePrefix}/${p.slug}`,
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
