import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

function isAdmin(sessionClaims: any) {
  return (sessionClaims?.publicMetadata as { role?: string })?.role === "admin";
}

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !isAdmin(sessionClaims))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { base64, folder } = await request.json();
  if (!base64) return NextResponse.json({ error: "No image data" }, { status: 400 });

  try {
    const url = await uploadImage(base64, folder ?? "blog");
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
