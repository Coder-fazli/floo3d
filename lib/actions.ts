"use server"
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { connectDb } from "./db";
import Project from "./models/Project";
import { uploadImage } from "./cloudinary";
import User from "./models/User";
import SiteSettings from "./models/SiteSettings";
import AppFrames from "./models/AppFrames";

export type FramesData = {
  fallbacks: Record<string, { before?: string; after?: string }>;
  styles: Record<string, Record<string, string>>; // inputType → styleName → url
  angles: Record<string, string>; // angleName → url
};


export async function getUserByClerkId(clerkId: string)
{
    await connectDb();
    const user = await User.findOne({ clerkId });   
    return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function getProjects(userId: string) {
    await connectDb();
    const projects = await Project.find({ userId }).sort("-createdAt");
    return JSON.parse(JSON.stringify(projects));
}

export async function getLatestRender() {
    await connectDb();
    const project = await Project.findOne({
        renderedImageUrl: { $exists: true, $ne: null },
        originalImageUrl: { $exists: true, $ne: null },
    }).sort("-createdAt");
    return project ? JSON.parse(JSON.stringify(project)) : null;
}

export async function getProject(id: string) {
    if (!id || id === "new" || !/^[a-f\d]{24}$/i.test(id)) return null;
    await connectDb();
    const project = await Project.findById(id);
    return project ? JSON.parse(JSON.stringify(project)) : null;
}

export async function updateProject(id: string, renderedImageUrl: string) {
 await connectDb();
 await Project.findByIdAndUpdate(id, {
    renderedImageUrl, status: "done"
 });
}

// Credit managment for users(Ai generation costs credits)

export async function getCredits(userId: string, name?: string, email?: string) {
    await connectDb();
    const update: any = { $setOnInsert: { credits: 10 } };
    if (name) update.$set = { ...(update.$set ?? {}), name };
    if (email) update.$set = { ...(update.$set ?? {}), email };
    const user = await User.findOneAndUpdate(
        { clerkId: userId },
        update,
        { upsert: true, new: true }
    );
    return user.credits;
}

export async function deductCredit(userId:string) {
    await connectDb();
    await User.findOneAndUpdate(
        { clerkId: userId },
        { $inc: { credits: -3 } }
    );
}

export async function getAllProjects() {
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

// Ф
export async function getAllUSers() {
    noStore();
    await connectDb();
    const users = await User.find({}).sort("-createdAt");
    return JSON.parse(JSON.stringify(users));
}

export async function updateUserCredits(clerkId: string, credits: number) {
    await connectDb();
    await User.findOneAndUpdate({ clerkId }, { credits });
}

export async function deleteUSer(clerkId: string) {
    await connectDb();
    await User.findOneAndDelete({ clerkId });
}

// Reads the Homre page Seo settings from DB, if nothing saved yet, returrns the defaults

export async function getSiteSettings(){
    await connectDb();
    const settings = await SiteSettings.findOne({ key: "home" });
    return settings ? JSON.parse(JSON.stringify(settings)): null
}

export async function saveSiteSettings(metaTitle: string, metaDescription: string) {
    await connectDb();
    await SiteSettings.findOneAndUpdate(
        { key: "home" },
        { metaTitle, metaDescription },
        { upsert: true, new: true }
    );
}

export async function getAppFrames(): Promise<FramesData> {
  await connectDb();
  const doc = await AppFrames.findOne({ key: "main" }).lean();
  return {
    fallbacks: (doc as any)?.fallbacks ?? {},
    styles:    (doc as any)?.styles    ?? {},
    angles:    (doc as any)?.angles    ?? {},
  };
}

// key = inputType, slot = "before"/"after" for fallbacks OR styleName for styles
export async function saveFrameImage(
  category: "fallback" | "style" | "angle",
  key: string,
  slot: string,
  base64: string
): Promise<string> {
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

export type HomeImages = {
  heroBeforeUrl: string | null;
  heroAfterUrl: string | null;
  transformImages: Record<string, { before?: string; after?: string }>;
};

export async function getHomeImages(): Promise<HomeImages> {
  await connectDb();
  const doc = await SiteSettings.findOne({ key: "home" });
  return {
    heroBeforeUrl: doc?.heroBeforeUrl ?? null,
    heroAfterUrl: doc?.heroAfterUrl ?? null,
    transformImages: doc?.transformImages ?? {},
  };
}

export async function saveHomeImage(
  slot: "hero-before" | "hero-after" | `transform-${string}-before` | `transform-${string}-after`,
  base64: string
): Promise<string> {
  const url = await uploadImage(base64, "home-images");
  await connectDb();

  let doc = await SiteSettings.findOne({ key: "home" });
  if (!doc) doc = await SiteSettings.create({ key: "home" });

  if (slot === "hero-before") {
    doc.heroBeforeUrl = url;
  } else if (slot === "hero-after") {
    doc.heroAfterUrl = url;
  } else {
    // transform-01-before, transform-02-after, etc.
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

export async function saveFloorPlanSettings(floorPlanMetaTitle: string, floorPlanMetaDescription: string) {
    await connectDb();
    await SiteSettings.findOneAndUpdate(
        { key: "home" },
        { floorPlanMetaTitle, floorPlanMetaDescription },
        { upsert: true, new: true }
    );
}

export async function saveFloorPlanGeneratorSettings(floorPlanGeneratorMetaTitle: string, floorPlanGeneratorMetaDescription: string) {
    await connectDb();
    await SiteSettings.findOneAndUpdate(
        { key: "home" },
        { floorPlanGeneratorMetaTitle, floorPlanGeneratorMetaDescription },
        { upsert: true, new: true }
    );
}