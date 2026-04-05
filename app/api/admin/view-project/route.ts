import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const { userId } = await auth();
  if (userId !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("adminView", "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "strict",
  });

  return NextResponse.json({ ok: true });
}
