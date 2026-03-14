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
  const title = s?.metaTitle ?? "Floo3D – Convert 2D Floor Plans to 3D Renders with AI";
  const description = s?.metaDescription ?? "Upload any 2D floor plan and get a photorealistic 3D render in under 60 seconds. Free to start. No 3D software needed. Used by architects, designers & real estate pros.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      title,
      description,
      url: "https://floo3d.com",
      siteName: "Floo3D",
      images: [{ url: "https://floo3d.com/og-image.png", width: 512, height: 512, alt: "Floo3D" }],
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["https://floo3d.com/og-image.png"],
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
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Floo3D",
                applicationCategory: "DesignApplication",
                operatingSystem: "Web",
                url: "https://floo3d.com",
                description: "AI-powered tool that transforms 2D floor plans into photorealistic 3D renders in seconds.",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1200" },
                author: { "@type": "Organization", name: "Floo3D", url: "https://floo3d.com" },
              }),
            }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
