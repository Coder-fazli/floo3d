"use server"
import { unstable_noStore as noStore } from "next/cache";
import { connectDb } from "./db";
import Project from "./models/Project";
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

export async function updateProject(id: string, renderedImageUrl: string, style?: string, roomType?: string) {
 await connectDb();
 await Project.findByIdAndUpdate(id, {
    $set: { renderedImageUrl, status: "done" },
    $push: { renders: { url: renderedImageUrl, style: style ?? "Modern", roomType: roomType ?? "", createdAt: new Date() } },
 });
}

// Credit managment for users(Ai generation costs credits)

export async function getCredits(userId: string, name?: string, email?: string) {
    await connectDb();
    const update: any = { $setOnInsert: { credits: 4 } };
    if (name) update.$set = { ...(update.$set ?? {}), name };
    if (email) update.$set = { ...(update.$set ?? {}), email };
    const user = await User.findOneAndUpdate(
        { clerkId: userId },
        update,
        { upsert: true, new: true }
    );
    return user.credits;
}

export async function getUserInfo(userId: string): Promise<{ credits: number; hasPurchased: boolean }> {
    await connectDb();
    const user = await User.findOne({ clerkId: userId });
    return { credits: user?.credits ?? 4, hasPurchased: user?.hasPurchased ?? false };
}

export async function deductCredit(userId:string) {
    await connectDb();
    await User.findOneAndUpdate(
        { clerkId: userId },
        { $inc: { credits: -2 } }
    );
}

export async function getSiteSettings(){
    await connectDb();
    const settings = await SiteSettings.findOne({ key: "home" });
    return settings ? JSON.parse(JSON.stringify(settings)): null
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

export async function getHomeImages(): Promise<{ heroBeforeUrl: string | null; heroAfterUrl: string | null; transformImages: Record<string, { before?: string; after?: string }> }> {
  await connectDb();
  const doc = await SiteSettings.findOne({ key: "home" });
  return {
    heroBeforeUrl: doc?.heroBeforeUrl ?? null,
    heroAfterUrl: doc?.heroAfterUrl ?? null,
    transformImages: doc?.transformImages ?? {},
  };
}

export type FpgImages = {
  heroBeforeUrl: string | null;
  heroAfterUrl: string | null;
};

export async function getFpgImages(): Promise<FpgImages> {
  await connectDb();
  const doc = await SiteSettings.findOne({ key: "home" });
  return {
    heroBeforeUrl: doc?.fpgHeroBeforeUrl ?? null,
    heroAfterUrl:  doc?.fpgHeroAfterUrl  ?? null,
  };
}

export async function getModelSettings(): Promise<Record<string, string>> {
  await connectDb();
  const doc = await SiteSettings.findOne({ key: "home" });
  return doc?.models ?? {};
}