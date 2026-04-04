"use server"
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "./db";
import { uploadImage } from "./cloudinary";
import { unstable_noStore as noStore } from "next/cache";
import User from "./models/User";
import Project from "./models/Project";
import SiteSettings from "./models/SiteSettings";
import AppFrames from "./models/AppFrames";
import GenerationLog from "./models/GenerationLog";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as any)?.role;
  if (!userId || role !== "admin") throw new Error("Unauthorized");
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getAllProjects() {
  await requireAdmin();
  noStore();
  await connectDb();
  const [projects, users] = await Promise.all([
    Project.find({}).sort("-createdAt"),
    User.find({}, { clerkId: 1, name: 1, email: 1 }),
  ]);
  const userMap: Record<string, { name: string; email: string }> = {};
  for (const u of users) userMap[u.clerkId] = { name: u.name, email: u.email };
  const result = projects.map((p: any) => ({
    ...p.toObject(),
    userName: userMap[p.userId]?.name || "",
    userEmail: userMap[p.userId]?.email || "",
  }));
  return JSON.parse(JSON.stringify(result));
}

export async function getAllUSers() {
  await requireAdmin();
  noStore();
  await connectDb();
  const users = await User.find({}).sort("-createdAt");
  return JSON.parse(JSON.stringify(users));
}

export async function updateUserCredits(clerkId: string, credits: number) {
  await requireAdmin();
  await connectDb();
  await User.findOneAndUpdate({ clerkId }, { credits });
}

export async function deleteUSer(clerkId: string) {
  await requireAdmin();
  await connectDb();
  await User.findOneAndDelete({ clerkId });
}

// ─── SEO Settings ─────────────────────────────────────────────────────────────

export async function saveSiteSettings(metaTitle: string, metaDescription: string) {
  await requireAdmin();
  await connectDb();
  await SiteSettings.findOneAndUpdate(
    { key: "home" },
    { metaTitle, metaDescription },
    { upsert: true, new: true }
  );
}

export async function saveFloorPlanSettings(floorPlanMetaTitle: string, floorPlanMetaDescription: string) {
  await requireAdmin();
  await connectDb();
  await SiteSettings.findOneAndUpdate(
    { key: "home" },
    { floorPlanMetaTitle, floorPlanMetaDescription },
    { upsert: true, new: true }
  );
}

export async function saveFloorPlanGeneratorSettings(floorPlanGeneratorMetaTitle: string, floorPlanGeneratorMetaDescription: string) {
  await requireAdmin();
  await connectDb();
  await SiteSettings.findOneAndUpdate(
    { key: "home" },
    { floorPlanGeneratorMetaTitle, floorPlanGeneratorMetaDescription },
    { upsert: true, new: true }
  );
}

// ─── Home Images ──────────────────────────────────────────────────────────────

export type HomeImages = {
  heroBeforeUrl: string | null;
  heroAfterUrl: string | null;
  transformImages: Record<string, { before?: string; after?: string }>;
};

export async function saveHomeImage(
  slot: "hero-before" | "hero-after" | `transform-${string}-before` | `transform-${string}-after`,
  base64: string
): Promise<string> {
  await requireAdmin();
  const url = await uploadImage(base64, "home-images");
  await connectDb();

  let doc = await SiteSettings.findOne({ key: "home" });
  if (!doc) doc = await SiteSettings.create({ key: "home" });

  if (slot === "hero-before") {
    doc.heroBeforeUrl = url;
  } else if (slot === "hero-after") {
    doc.heroAfterUrl = url;
  } else {
    const [, section, side] = slot.split("-");
    const images = { ...(doc.transformImages ?? {}) };
    images[section] = { ...(images[section] ?? {}), [side]: url };
    doc.transformImages = images;
    doc.markModified("transformImages");
  }

  await doc.save();
  revalidatePath("/");
  revalidatePath("/secure-7x9/home");
  return url;
}

// ─── FPG Images ───────────────────────────────────────────────────────────────

export async function saveFpgImage(
  slot: "hero-before" | "hero-after",
  base64: string
): Promise<string> {
  await requireAdmin();
  const url = await uploadImage(base64, "fpg-images");
  await connectDb();
  let doc = await SiteSettings.findOne({ key: "home" });
  if (!doc) doc = await SiteSettings.create({ key: "home" });
  if (slot === "hero-before") doc.fpgHeroBeforeUrl = url;
  else doc.fpgHeroAfterUrl = url;
  await doc.save();
  revalidatePath("/floor-plan-generator");
  revalidatePath("/secure-7x9/floor-plan-generator");
  return url;
}

// ─── Frames ───────────────────────────────────────────────────────────────────

export async function saveFrameImage(
  category: "fallback" | "style" | "angle",
  key: string,
  slot: string,
  base64: string
): Promise<string> {
  await requireAdmin();
  const url = await uploadImage(base64, "frames");
  await connectDb();

  let doc = await AppFrames.findOne({ key: "main" });
  if (!doc) doc = await AppFrames.create({ key: "main", fallbacks: {}, styles: {}, angles: {} });

  if (category === "fallback") {
    const fallbacks = { ...(doc.fallbacks ?? {}) };
    fallbacks[key] = { ...(fallbacks[key] ?? {}), [slot]: url };
    doc.fallbacks = fallbacks;
    doc.markModified("fallbacks");
  } else if (category === "style") {
    const styles = { ...(doc.styles ?? {}) };
    styles[key] = { ...(styles[key] ?? {}), [slot]: url };
    doc.styles = styles;
    doc.markModified("styles");
  } else if (category === "angle") {
    const angles = { ...(doc.angles ?? {}), [key]: url };
    doc.angles = angles;
    doc.markModified("angles");
  }

  await doc.save();

  revalidatePath("/secure-7x9/frames");
  revalidatePath("/dashboard");
  revalidatePath("/visualizer/[id]", "page");
  revalidatePath("/2d-to-3d-floor-plan-converter");

  return url;
}

// ─── Generation Logs ──────────────────────────────────────────────────────────

export async function getAllLogs(limit = 200) {
  await requireAdmin();
  noStore();
  await connectDb();
  const logs = await GenerationLog.find({}).sort("-createdAt").limit(limit);
  return JSON.parse(JSON.stringify(logs));
}

// ─── Gemini Models Settings ──────────────────────────────────────────────────────────────

export async function saveModelSettings(models: Record<string, string>) {
  await requireAdmin();
  await connectDb();
  await SiteSettings.findOneAndUpdate(
    { key: "home" },                               
    { models },       
    { upsert: true, new: true }   
  );
  revalidatePath("/secure-7x9/models");
}

