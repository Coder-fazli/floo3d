"use server"
import { revalidatePath } from "next/cache";
import { connectDb } from "./db";
import Project from "./models/Project";
import { uploadImage } from "./cloudinary";
import User from "./models/User";
import SiteSettings from "./models/SiteSettings";
import AppFrames from "./models/AppFrames";

export type FramesData = {
  fallbacks: Record<string, { before?: string; after?: string }>;
  styles: Record<string, string>;
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
    await connectDb();
    const project = await Project.findById(id);
    return JSON.parse(JSON.stringify(project));
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
    if (name || email) {
        update.$set = { name: name ?? "", email: email ?? "" };
    }
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
        { $inc: { credits: -2 } }
    );
}

export async function getAllProjects() {
    await connectDb();
    const projects = await Project.find({}).sort("-createdAt");
    return JSON.parse(JSON.stringify(projects));
}

// Ф
export async function getAllUSers() {
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
  const doc = await AppFrames.findOne({ key: "main" });
  return {
    fallbacks: doc?.fallbacks ?? {},
    styles:    doc?.styles    ?? {},
  };
}

export async function saveFrameImage(
  category: "fallback" | "style",
  key: string,
  slot: "before" | "after" | null,
  base64: string
): Promise<string> {
  const url = await uploadImage(base64, "frames");
  await connectDb();

  // Fetch or create the single document
  let doc = await AppFrames.findOne({ key: "main" });
  if (!doc) doc = await AppFrames.create({ key: "main", fallbacks: {}, styles: {} });

  if (category === "fallback") {
    // Spread into a new object so Mongoose detects the change on the Mixed field
    const fallbacks = { ...(doc.fallbacks ?? {}) };
    fallbacks[key] = { ...(fallbacks[key] ?? {}), [slot!]: url };
    doc.fallbacks = fallbacks;
    doc.markModified("fallbacks");
  } else {
    const styles = { ...(doc.styles ?? {}) };
    styles[key] = url;
    doc.styles = styles;
    doc.markModified("styles");
  }

  await doc.save();

  // Invalidate all pages that display frames
  revalidatePath("/secure-7x9/frames");
  revalidatePath("/dashboard");
  revalidatePath("/visualizer/[id]", "page");
  revalidatePath("/2d-to-3d-floor-plan-converter");

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