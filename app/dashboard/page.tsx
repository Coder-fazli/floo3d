import { auth } from "@clerk/nextjs/server";
import { getAppFrames, getUserByClerkId } from "@/lib/actions";
import DashboardClient from "./DashboardClient";
import { Suspense } from "react";

export default async function DashboardPage() {
  const { userId } = await auth();
  const [frames, dbUser] = await Promise.all([
    getAppFrames(),
    userId ? getUserByClerkId(userId) : null,
  ]);
  const emailPrefix = dbUser?.email ? dbUser.email.split("@")[0] : null;
  const displayName = dbUser?.name || emailPrefix || null;
  return (
    <Suspense>
      <DashboardClient frames={frames} displayName={displayName} />
    </Suspense>
  );
}
