import { getPricingSettings } from "@/lib/actions.admin";
import PricingAdmin from "./PricingAdmin";

export default async function AdminPricingPage() {
  const settings = await getPricingSettings();
  return <PricingAdmin settings={settings} />;
}
