import { getAppFrames } from "@/lib/actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const frames = await getAppFrames();
  return <DashboardClient frames={frames} />;
}
