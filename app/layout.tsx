import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Instrument_Serif, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getSiteSettings } from "@/lib/actions";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" });

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
        <body className={`${inter.variable} ${instrumentSerif.variable}`}>
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
