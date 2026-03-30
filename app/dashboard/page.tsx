import { auth } from "@clerk/nextjs/server";
import { getAppFrames, getUserByClerkId } from "@/lib/actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  const [frames, dbUser] = await Promise.all([
    getAppFrames(),
    userId ? getUserByClerkId(userId) : null,
  ]);
  return <DashboardClient frames={frames} displayName={dbUser?.name || null} />;
}
