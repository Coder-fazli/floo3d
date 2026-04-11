import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingClient from "./PricingClient";
import { getPricingSettings } from "@/lib/actions.admin";

export const metadata = {
  title: "Pricing — MyHomeStyler",
  description: "Simple, transparent pricing for AI floor plan generation and interior design. Start free, upgrade when ready.",
  alternates: { canonical: "https://myhomestyler.com/pricing" },
  robots: { index: true, follow: true },
};

export default async function PricingPage() {
  const pricingSettings = await getPricingSettings();
  return (
    <div style={{ background: "#FDF6F2", minHeight: "100vh" }}>
      <Navbar />
      <Suspense>
        <PricingClient pricingSettings={pricingSettings} />
      </Suspense>
      <Footer />
    </div>
  );
}
