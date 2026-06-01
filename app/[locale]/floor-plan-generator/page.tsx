import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import FloorPlanGeneratorHero from "@/components/FloorPlanGeneratorHero";
import HowItWorks2 from "@/components/HowItWorks2";
import DesignOptions from "@/components/DesignOptions";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import FaqServer from "@/components/FaqServer";
import "@/components/FAQ.css";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import { getSiteSettings, getFpgImages } from "@/lib/actions";
import { localizedUrl } from "@/lib/seo";

const PATH = "/floor-plan-generator";

const COPY = {
  en: {
    title: "AI Floor Plan Generator — Create Custom Floor Plans Free Online",
    desc: "Generate a custom 2D floor plan from scratch using AI. Choose your rooms, size, and style — get a professional floor plan in seconds. Free to start.",
    schemaName: "MyHomeStyler AI Floor Plan Generator",
    breadcrumb: "AI Floor Plan Generator",
    home: "Home",
  },
  ar: {
    title: "مولّد مخططات المنازل بالذكاء الاصطناعي — أنشئ مخططات مخصصة مجاناً أونلاين",
    desc: "أنشئ مخطط منزل ثنائي الأبعاد مخصصاً من الصفر بالذكاء الاصطناعي. اختر غرفك ومساحتك وأسلوبك — واحصل على مخطط احترافي في ثوانٍ. مجاني للبدء.",
    schemaName: "مولّد مخططات المنازل MyHomeStyler بالذكاء الاصطناعي",
    breadcrumb: "مولّد مخططات المنازل بالذكاء الاصطناعي",
    home: "الرئيسية",
  },
};

const FAQS = {
  en: [
    { q: "Is the AI floor plan generator free to use?", a: "Yes — our AI floor plan generator free tool lets you create professional floor plans without a credit card. New accounts receive free credits instantly so you can start generating right away." },
    { q: "What is an AI floor plan generator?", a: "An AI floor plan generator is a tool that automatically creates architectural floor plans based on your inputs — property type, room count, size, and style. Instead of drawing manually, the AI blueprint generator handles the layout and design for you in seconds." },
    { q: "What can the AI blueprint generator create?", a: "The AI blueprint generator can produce three types of floor plans: black and white architectural blueprints, soft colored room plans with furniture icons, and isometric 3D-style views. It works for houses, apartments, villas, studios, and offices." },
    { q: "Can I convert the AI-generated floor plan to a 3D render?", a: "Yes. After the AI floor plan generator creates your plan, click Convert to 3D to open it in the visualizer and generate a photorealistic 3D render from it — no extra uploads needed." },
    { q: "How long does the AI floor plan generator take?", a: "Most results from the AI floor plan generator are ready in 15–30 seconds. You will see a live loading indicator while the AI is working on your layout." },
    { q: "What property types does it support?", a: "The AI blueprint generator supports House, Apartment, Villa, Studio, and Office. Each property type affects how the AI distributes rooms and spaces across the floor plan." },
    { q: "Do I need to sign up to generate a floor plan?", a: "You need a free account to generate floor plans. Signing up takes under a minute and gives you free credits immediately — no credit card required." },
    { q: "Can I generate a multi-floor house plan?", a: "Yes. You can set the number of floors up to 5. The AI takes the floor count into account when generating the layout and distributing rooms across levels." },
  ],
  ar: [
    { q: "هل مولّد مخططات المنازل بالذكاء الاصطناعي مجاني؟", a: "نعم — أداتنا المجانية تتيح لك إنشاء مخططات احترافية بدون بطاقة ائتمان. الحسابات الجديدة تحصل على أرصدة مجانية فوراً لتبدأ الإنشاء على الفور." },
    { q: "ما هو مولّد مخططات المنازل بالذكاء الاصطناعي؟", a: "هو أداة تنشئ مخططات معمارية تلقائياً بناءً على مدخلاتك — نوع العقار، عدد الغرف، المساحة، والأسلوب. بدلاً من الرسم يدوياً، يتولّى المولّد التخطيط والتصميم في ثوانٍ." },
    { q: "ماذا يمكن للمولّد أن ينشئ؟", a: "يمكنه إنتاج ثلاثة أنواع من المخططات: مخططات معمارية بالأبيض والأسود، مخططات غرف ملوّنة بأيقونات أثاث، ومناظر ثلاثية الأبعاد متساوية القياس. يعمل للمنازل والشقق والفلل والاستوديوهات والمكاتب." },
    { q: "هل يمكنني تحويل المخطط المُنشأ إلى تصور ثلاثي الأبعاد؟", a: "نعم. بعد إنشاء مخططك، اضغط «تحويل إلى 3D» لفتحه في المُصوّر وإنشاء تصور فوتوغرافي ثلاثي الأبعاد منه — بدون رفع إضافي." },
    { q: "كم يستغرق المولّد؟", a: "تكون معظم النتائج جاهزة في 15–30 ثانية. سترى مؤشر تحميل مباشراً أثناء عمل الذكاء الاصطناعي على مخططك." },
    { q: "ما أنواع العقارات المدعومة؟", a: "يدعم المولّد: منزل، شقة، فيلا، استوديو، ومكتب. كل نوع يؤثر على كيفية توزيع الذكاء الاصطناعي للغرف والمساحات عبر المخطط." },
    { q: "هل أحتاج للتسجيل لإنشاء مخطط؟", a: "تحتاج حساباً مجانياً لإنشاء المخططات. التسجيل يستغرق أقل من دقيقة ويمنحك أرصدة مجانية فوراً — بدون بطاقة ائتمان." },
    { q: "هل يمكنني إنشاء مخطط منزل متعدد الطوابق؟", a: "نعم. يمكنك تحديد عدد الطوابق حتى 5. يأخذ الذكاء الاصطناعي عدد الطوابق بعين الاعتبار عند إنشاء المخطط وتوزيع الغرف عبر المستويات." },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const c = isAr ? COPY.ar : COPY.en;
  const s = await getSiteSettings();
  const title = isAr ? c.title : (s?.floorPlanGeneratorMetaTitle || c.title);
  const description = isAr ? c.desc : (s?.floorPlanGeneratorMetaDescription || c.desc);
  return {
    title,
    description,
    alternates: {
      canonical: localizedUrl(PATH, locale),
      languages: {
        en: localizedUrl(PATH, "en"),
        "ar-AE": localizedUrl(PATH, "ar"),
        "x-default": localizedUrl(PATH, "en"),
      },
    },
    openGraph: {
      title,
      description,
      url: localizedUrl(PATH, locale),
      locale: isAr ? "ar_AE" : "en_US",
      images: [{ url: "/og-floor-plan-generator.jpg", width: 1200, height: 630 }],
    },
  };
}

function buildJsonLd(locale: string) {
  const isAr = locale === "ar";
  const c = isAr ? COPY.ar : COPY.en;
  const faqs = isAr ? FAQS.ar : FAQS.en;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: c.schemaName,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: localizedUrl(PATH, locale),
        inLanguage: isAr ? "ar-AE" : "en-US",
        offers: { "@type": "Offer", price: "0", priceCurrency: isAr ? "AED" : "USD" },
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1840", bestRating: "5", worstRating: "1" },
        description: c.desc,
        screenshot: "https://myhomestyler.com/og-floor-plan-generator.jpg",
      },
      {
        "@type": "FAQPage",
        inLanguage: isAr ? "ar-AE" : "en-US",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: c.home, item: localizedUrl("/", locale) },
          { "@type": "ListItem", position: 2, name: c.breadcrumb, item: localizedUrl(PATH, locale) },
        ],
      },
    ],
  };
}

export default async function FloorPlanGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = locale === "ar" ? "ar" : "en";
  const fpgImages = await getFpgImages();
  return (
    <div className="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }} />
      <Navbar />
      <FloorPlanGeneratorHero
        heroBeforeUrl={fpgImages.heroBeforeUrl ?? undefined}
        heroAfterUrl={fpgImages.heroAfterUrl ?? undefined}
        lang={lang}
      />
      <HowItWorks2 />
      <DesignOptions />
      <RecentProjects />
      <TestimonialsMarquee />
      <FaqServer twoColumns faqs={lang === "ar" ? FAQS.ar : FAQS.en} />
      <Footer />
    </div>
  );
}
