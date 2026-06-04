import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import FloorPlanHero from "@/components/FloorPlanHero";
import DesignOptions from "@/components/DesignOptions";
import HowItWorks2 from "@/components/HowItWorks2";
import RecentProjects from "@/components/RecentProjects";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import TestimonialsMarquee, { type Testimonial, Highlight } from "@/components/TestimonialsMarquee";
import { getSiteSettings } from "@/lib/actions";
import { localizedUrl } from "@/lib/seo";

const PATH = "/2d-to-3d-floor-plan-converter";

const COPY = {
  en: {
    title: "2D to 3D Floor Plan Converter — Convert 2D Floor Plan to 3D Model Free Online",
    desc: "Convert 2D floor plans to 3D models free online. Works with blueprints, house plans & hand-drawn sketches. Results in seconds.",
    schemaName: "MyHomeStyler 2D to 3D Floor Plan Converter",
    breadcrumb: "2D to 3D Floor Plan Converter",
    home: "Home",
  },
  ar: {
    title: "محوّل المخطط من 2D إلى 3D — حوّل مخطط المنزل ثنائي الأبعاد إلى تصور ثلاثي الأبعاد مجاناً",
    desc: "حوّل مخططات المنازل ثنائية الأبعاد إلى تصورات ثلاثية الأبعاد مجاناً عبر الإنترنت. يعمل مع المخططات المعمارية ومخططات المنازل والرسومات اليدوية. نتائج في ثوانٍ.",
    schemaName: "محوّل MyHomeStyler من 2D إلى 3D",
    breadcrumb: "محوّل المخطط من 2D إلى 3D",
    home: "الرئيسية",
  },
  es: {
    title: "Conversor de Planos 2D a 3D — Convierte tu Plano 2D en Modelo 3D Gratis Online",
    desc: "Convierte planos 2D en modelos 3D gratis online. Funciona con planos arquitectónicos, planos de casa y bocetos a mano. Resultados en segundos.",
    schemaName: "Conversor de Planos 2D a 3D de MyHomeStyler",
    breadcrumb: "Conversor de Planos 2D a 3D",
    home: "Inicio",
  },
};

const FAQS = {
  en: [
    { q: "Do I need to sign up or create an account?", a: "Yes, a free account is required to generate renders. Sign up takes seconds — no credit card needed. You get 2 free credits instantly on sign up." },
    { q: "Is it really free? Do you need a credit card?", a: "100% free to start — no credit card required. Create a free account and get 2 credits instantly. Pay only when you need more." },
    { q: "How many free conversions do I get?", a: "Create a free account and get 2 credits added to your balance immediately. No credit card, no subscription required." },
    { q: "What types of floor plans does it accept?", a: "It works with any 2D floor plan image — hand-drawn sketches, scanned blueprints, CAD exports (PNG/JPG), architectural drawings, or any 2D house plan image. As long as it's a PNG or JPG under 10MB, the AI can process it." },
    { q: "How long does the 3D conversion take?", a: "Most 2D floor plans are converted to a 3D render in 15–30 seconds. Complex plans with many rooms may take up to 60 seconds. You'll see a live progress indicator while the AI is working." },
    { q: "Can I download the 3D render?", a: "Yes. Once your 3D render is ready, click the Download button to save it as a high-resolution PNG. Signed-in users get access to Ultra HD downloads and can save all renders to their project dashboard." },
    { q: "What design styles are available?", a: "You can choose from 6 styles: Modern, Scandinavian, Industrial, Rustic, Luxury, and Minimalist. Each style applies different materials, furniture, lighting, and finishes to your floor plan render." },
  ],
  ar: [
    { q: "هل أحتاج إلى إنشاء حساب؟", a: "نعم، يلزم حساب مجاني لإنشاء التصورات. التسجيل يستغرق ثوانٍ — بدون بطاقة ائتمان. تحصل على رصيدين مجانيين فور التسجيل." },
    { q: "هل هو مجاني فعلاً؟ هل أحتاج بطاقة ائتمان؟", a: "مجاني 100% للبدء — بدون بطاقة ائتمان. أنشئ حساباً مجانياً واحصل على رصيدين فوراً. ادفع فقط عند الحاجة للمزيد." },
    { q: "كم عدد التحويلات المجانية التي أحصل عليها؟", a: "أنشئ حساباً مجانياً واحصل على رصيدين يُضافان لرصيدك فوراً. بدون بطاقة ائتمان أو اشتراك." },
    { q: "ما أنواع المخططات التي يقبلها؟", a: "يعمل مع أي صورة مخطط ثنائي الأبعاد — رسومات يدوية، مخططات ممسوحة ضوئياً، ملفات CAD (PNG/JPG)، رسومات معمارية، أو أي صورة مخطط منزل. طالما أنها PNG أو JPG أقل من 10 ميغابايت، يمكن للذكاء الاصطناعي معالجتها." },
    { q: "كم يستغرق التحويل إلى ثلاثي الأبعاد؟", a: "تُحوَّل معظم المخططات إلى تصور ثلاثي الأبعاد في 15–30 ثانية. المخططات المعقدة بغرف كثيرة قد تستغرق حتى 60 ثانية. سترى مؤشر تقدم مباشر أثناء عمل الذكاء الاصطناعي." },
    { q: "هل يمكنني تنزيل التصور ثلاثي الأبعاد؟", a: "نعم. بمجرد جاهزية تصورك، اضغط زر التنزيل لحفظه كصورة PNG عالية الدقة. المستخدمون المسجّلون يحصلون على تنزيلات Ultra HD ويمكنهم حفظ جميع التصورات في لوحة مشاريعهم." },
    { q: "ما أساليب التصميم المتاحة؟", a: "يمكنك الاختيار من 6 أساليب: عصري، إسكندنافي، صناعي، ريفي، فاخر، وبسيط. كل أسلوب يطبّق مواد وأثاثاً وإضاءة ولمسات مختلفة على تصور مخططك." },
  ],
  es: [
    { q: "¿Necesito registrarme o crear una cuenta?", a: "Sí, se necesita una cuenta gratuita para generar renders. Registrarte lleva segundos — sin tarjeta de crédito. Recibes 2 créditos gratis al instante al registrarte." },
    { q: "¿Es realmente gratis? ¿Hace falta tarjeta de crédito?", a: "100% gratis para empezar — sin tarjeta de crédito. Crea una cuenta gratuita y obtén 2 créditos al instante. Paga solo cuando necesites más." },
    { q: "¿Cuántas conversiones gratis obtengo?", a: "Crea una cuenta gratuita y obtén 2 créditos añadidos a tu saldo de inmediato. Sin tarjeta de crédito ni suscripción." },
    { q: "¿Qué tipos de planos acepta?", a: "Funciona con cualquier imagen de plano 2D — bocetos a mano, planos escaneados, exportaciones CAD (PNG/JPG), dibujos arquitectónicos o cualquier imagen de plano de casa en 2D. Mientras sea un PNG o JPG de menos de 10 MB, la IA puede procesarlo." },
    { q: "¿Cuánto tarda la conversión a 3D?", a: "La mayoría de los planos 2D se convierten en un render 3D en 15–30 segundos. Los planos complejos con muchas habitaciones pueden tardar hasta 60 segundos. Verás un indicador de progreso en directo mientras la IA trabaja." },
    { q: "¿Puedo descargar el render 3D?", a: "Sí. Cuando tu render 3D esté listo, pulsa el botón Descargar para guardarlo como PNG de alta resolución. Los usuarios registrados acceden a descargas en Ultra HD y pueden guardar todos sus renders en su panel de proyectos." },
    { q: "¿Qué estilos de diseño hay disponibles?", a: "Puedes elegir entre 6 estilos: Moderno, Escandinavo, Industrial, Rústico, Lujo y Minimalista. Cada estilo aplica diferentes materiales, muebles, iluminación y acabados al render de tu plano." },
  ],
};

const converterTestimonials: Testimonial[] = [
  { name: "James Okafor", role: "Real Estate Agent", img: "https://randomuser.me/api/portraits/men/32.jpg", description: <p>I used this to <Highlight>convert blueprint to 3D model</Highlight> for every listing. Buyers can now visualize the space before visiting. Our conversion rate went up noticeably.</p> },
  { name: "Sarah Mitchell", role: "Interior Designer", img: "https://randomuser.me/api/portraits/women/44.jpg", description: <p>I needed a <Highlight>floor plan to 3D model free online</Highlight> solution for client presentations. MyHomeStyler delivered photorealistic results in seconds.</p> },
  { name: "Carlos Rivera", role: "Architect", img: "https://randomuser.me/api/portraits/men/55.jpg", description: <p>The best tool to <Highlight>convert blueprint to 3D model</Highlight> I have used. Shockingly accurate — I show clients their space before detailed plans are done.</p> },
  { name: "Lena Bauer", role: "Homeowner", img: "https://randomuser.me/api/portraits/women/68.jpg", description: <p>Found this searching for <Highlight>floor plan to 3D model free</Highlight> tools. Uploaded my renovation sketch and got a stunning render instantly.</p> },
  { name: "Amina Hassan", role: "Property Developer", img: "https://randomuser.me/api/portraits/women/12.jpg", description: <p>We generate renders for all floor plan variations using this <Highlight>floor plan to 3D model free online</Highlight> tool. What used to take a week now takes an afternoon.</p> },
  { name: "Tom Eriksson", role: "Renovation Contractor", img: "https://randomuser.me/api/portraits/men/14.jpg", description: <p>Clients bring their blueprints and I <Highlight>convert blueprint to 3D model</Highlight> on the spot. It closes deals faster than anything else.</p> },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const s = await getSiteSettings();
  // English can be overridden from the CMS; ar/es use the hardcoded translated copy.
  const title = locale === "en" ? (s?.floorPlanMetaTitle || c.title) : c.title;
  const description = locale === "en" ? (s?.floorPlanMetaDescription || c.desc) : c.desc;
  return {
    title,
    description,
    alternates: {
      canonical: localizedUrl(PATH, locale),
      languages: {
        en: localizedUrl(PATH, "en"),
        "ar-AE": localizedUrl(PATH, "ar"),
        "es-ES": localizedUrl(PATH, "es"),
        "x-default": localizedUrl(PATH, "en"),
      },
    },
    openGraph: {
      title,
      description,
      url: localizedUrl(PATH, locale),
      locale: locale === "ar" ? "ar_AE" : locale === "es" ? "es_ES" : "en_US",
      images: [{ url: "/og-2d-to-3d-floor-plan.jpg", width: 1200, height: 630 }],
    },
  };
}

function buildJsonLd(locale: string) {
  const c = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const faqs = FAQS[locale as keyof typeof FAQS] ?? FAQS.en;
  const inLanguage = locale === "ar" ? "ar-AE" : locale === "es" ? "es-ES" : "en-US";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: c.schemaName,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: localizedUrl(PATH, locale),
        inLanguage,
        offers: { "@type": "Offer", price: "0", priceCurrency: locale === "ar" ? "AED" : locale === "es" ? "EUR" : "USD" },
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "2547", bestRating: "5", worstRating: "1" },
        description: c.desc,
        screenshot: "https://myhomestyler.com/og-2d-to-3d-floor-plan.jpg",
      },
      {
        "@type": "FAQPage",
        inLanguage,
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

export default async function FloorPlanConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = (["ar", "es"].includes(locale) ? locale : "en") as "en" | "ar" | "es";
  return (
    <div className="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }} />
      <Navbar />
      <FloorPlanHero lang={lang} />
      <HowItWorks2 />
      <DesignOptions />
      <RecentProjects />
      <TestimonialsMarquee items={converterTestimonials} />
      <FAQ twoColumns faqs={FAQS[lang] ?? FAQS.en} />
      <Footer />
    </div>
  );
}
