import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingClient from "./PricingClient";

export const metadata = {
  title: "Pricing — MyHomeStyler",
  description: "Simple, transparent pricing for AI floor plan generation and interior design. Start free, upgrade when ready.",
  alternates: { canonical: "https://myhomestyler.com/pricing" },
  robots: { index: true, follow: true },
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <Suspense>
        <PricingClient />
      </Suspense>
      <Footer />
    </>
  );
}
