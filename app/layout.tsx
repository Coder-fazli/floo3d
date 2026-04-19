import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Instrument_Serif, Geist, Playfair_Display, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./theme-test.css";
import { cn } from "@/lib/utils";
import { getSiteSettings } from "@/lib/actions";
import CrispChat from "@/components/CrispChat";
import CookieBanner from "@/components/CookieBanner";
import Script from "next/script";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400","700","900"], variable: "--font-playfair" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300","400","600"], variable: "--font-cormorant" });
const jakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-jakarta" });

export async function generateMetadata() {
  const s = await getSiteSettings();
  const title = s?.metaTitle ?? "MyHomeStyler – Free Home Design AI Tool | 2D to 3D in Seconds";
  const description = s?.metaDescription ?? "Free home design AI tool. Transform any floor plan into a stunning 3D render in seconds. No software needed — used by architects, designers & homeowners.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    verification: {
      google: "VQWIPVTjBUsZ0y8muOavx22CA_-t8Ld0bNR78zDxEWM",
    },
    other: {
      "google-adsense-account": "ca-pub-6790452039559569",
    },
    alternates: {
      canonical: "https://myhomestyler.com",
    },
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      title,
      description,
      url: "https://myhomestyler.com",
      siteName: "MyHomeStyler",
      images: [{ url: "https://myhomestyler.com/og-image.png", width: 512, height: 512, alt: "MyHomeStyler" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://myhomestyler.com/og-image.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", geist.variable)}>
        <body className={`${inter.variable} ${instrumentSerif.variable} ${playfair.variable} ${cormorant.variable} ${jakartaSans.variable}`}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                {
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  name: "MyHomeStyler",
                  applicationCategory: "DesignApplication",
                  operatingSystem: "Web",
                  url: "https://myhomestyler.com",
                  description: "Free home design AI tool. Transform any floor plan into a stunning 3D render in seconds.",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
                  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1200", bestRating: "5", worstRating: "1" },
                  author: { "@type": "Organization", name: "MyHomeStyler", url: "https://myhomestyler.com" },
                  screenshot: "https://myhomestyler.com/og-image.png",
                },
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  name: "MyHomeStyler",
                  url: "https://myhomestyler.com",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://myhomestyler.com/?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  name: "MyHomeStyler",
                  url: "https://myhomestyler.com",
                  logo: "https://myhomestyler.com/favicon.png",
                  sameAs: [],
                },
              ]),
            }}
          />
          {/* Google AdSense */}
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6790452039559569"
            crossOrigin="anonymous"
          />

          {/* Yandex Metrika */}
          <Script
            id="yandex-metrika"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=108254799','ym');
                ym(108254799,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});
              `,
            }}
          />
          <noscript>
            <img src="https://mc.yandex.ru/watch/108254799" style={{ position: "absolute", left: -9999 }} alt="" />
          </noscript>
          <CrispChat />
          {children}
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}
