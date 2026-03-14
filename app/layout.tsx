import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Instrument_Serif, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Floo3D – AI 2D to 3D Floor Plan Renderer",
  description: "Transform any 2D floor plan into a stunning photorealistic 3D render in seconds. Powered by AI. Built for architects, interior designers, and real estate professionals.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Floo3D – AI 2D to 3D Floor Plan Renderer",
    description: "Upload a floor plan. Get a photorealistic 3D render in seconds.",
    url: "https://floo3d.com",
    siteName: "Floo3D",
    images: [{ url: "https://floo3d.com/og-image.png", width: 1200, height: 630, alt: "Floo3D – AI Floor Plan Renderer" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Floo3D – AI 2D to 3D Floor Plan Renderer",
    description: "Upload a floor plan. Get a photorealistic 3D render in seconds.",
    images: ["https://floo3d.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.9",
                  reviewCount: "1200",
                },
                author: {
                  "@type": "Organization",
                  name: "Floo3D",
                  url: "https://floo3d.com",
                },
              }),
            }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
