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
import Order from "./models/Order";
import PricingSettings from "./models/PricingSettings";

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
  const users = await User.find({}).sort("-createdAt").lean();

  // Get last used model for each user
  const userIds = users.map((u: any) => u.clerkId);
  const lastLogs = await GenerationLog.aggregate([
    { $match: { userId: { $in: userIds }, status: "success" } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$userId", model: { $first: "$model" } } },
  ]);
  const modelByUser: Record<string, string> = {};
  for (const l of lastLogs) modelByUser[l._id] = l.model;

  const result = users.map((u: any) => ({ ...u, lastModel: modelByUser[u.clerkId] ?? null }));
  return JSON.parse(JSON.stringify(result));
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

export async function getOrdersByUser(userId: string) {
  await connectDb();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(orders));
}

export async function getLogsByUser(userId: string) {
  await connectDb();
  const logs = await GenerationLog.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
  return JSON.parse(JSON.stringify(logs));
}

export async function getAnalytics(period: string) {
  await connectDb();

  const now = new Date();
  let from: Date | null = null;
  let to: Date = now;

  if (period === "today") {
    from = new Date(now); from.setHours(0, 0, 0, 0);
  } else if (period === "yesterday") {
    from = new Date(now); from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0);
    to = new Date(now); to.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    from = new Date(now); from.setDate(from.getDate() - 7);
  } else if (period === "month") {
    from = new Date(now); from.setDate(from.getDate() - 30);
  }

  const dateFilter = from ? { createdAt: { $gte: from, $lte: to } } : {};

  const [
    totalUsers, newUsers,
    totalProjects, newRenders,
    errors, orders,
    recentRenders, recentErrors, recentPurchases,
    recentlyActive,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments(dateFilter),
    Project.countDocuments(),
    GenerationLog.countDocuments({ ...dateFilter, status: "success" }),
    GenerationLog.countDocuments({ ...dateFilter, status: "error" }),
    Order.find(dateFilter).lean(),
    GenerationLog.find({ ...dateFilter, status: "success" }).sort({ createdAt: -1 }).limit(8).lean(),
    GenerationLog.find({ ...dateFilter, status: "error" }).sort({ createdAt: -1 }).limit(5).lean(),
    Order.find(dateFilter).sort({ createdAt: -1 }).limit(5).lean(),
    User.find({}).sort({ updatedAt: -1 }).limit(8).lean(),
  ]);

  const revenue = orders.reduce((s: number, o: any) => s + (o.amount ?? 0), 0);

  return JSON.parse(JSON.stringify({
    totalUsers, newUsers,
    totalProjects, newRenders,
    errors, revenue,
    recentRenders, recentErrors, recentPurchases,
    recentlyActive,
  }));
}

const MODEL_COSTS: Record<string, number> = {
  "gemini-3-pro-image-preview":     0.134,
  "gemini-3.1-flash-image-preview": 0.067,
  "gemini-2.5-flash-image":         0.039,
};

function getDateRange(period: string) {
  const now = new Date();
  let from: Date | null = null;
  let to: Date = now;
  if (period === "today") {
    from = new Date(now); from.setHours(0, 0, 0, 0);
  } else if (period === "yesterday") {
    from = new Date(now); from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0);
    to = new Date(now); to.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    from = new Date(now); from.setDate(from.getDate() - 7);
  } else if (period === "month") {
    from = new Date(now); from.setDate(from.getDate() - 30);
  }
  return { from, to, dateFilter: from ? { createdAt: { $gte: from, $lte: to } } : {} };
}

export async function getBusinessAnalytics(period: string) {
  await connectDb();
  const { from, to, dateFilter } = getDateRange(period);

  // Get all paid user IDs
  const paidUsers = await User.find({ hasPurchased: true }).distinct("clerkId");
  const paidSet = new Set(paidUsers);

  // Get all successful logs in period
  const logs = await GenerationLog.find({ ...dateFilter, status: "success" }).lean() as any[];

  // Split by free vs paid
  const paidLogs = logs.filter((l: any) => paidSet.has(l.userId));
  const freeLogs = logs.filter((l: any) => !paidSet.has(l.userId));

  // Calculate AI costs
  const calcCost = (ls: any[]) => ls.reduce((sum, l) => sum + (MODEL_COSTS[l.model] ?? 0.067), 0);
  const paidCost = calcCost(paidLogs);
  const freeCost = calcCost(freeLogs);
  const totalCost = paidCost + freeCost;

  // Revenue
  const orders = await Order.find(dateFilter).lean() as any[];
  const revenue = orders.reduce((s: number, o: any) => s + (o.amount ?? 0), 0) / 100;

  // Net profit & margin
  const netProfit = revenue - totalCost;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Tool usage breakdown
  const toolCounts: Record<string, number> = {};
  for (const l of logs) {
    toolCounts[l.inputType] = (toolCounts[l.inputType] ?? 0) + 1;
  }
  const toolUsage = Object.entries(toolCounts)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count);

  // Conversion rate
  const totalUsers = await User.countDocuments();
  const paidUsersCount = await User.countDocuments({ hasPurchased: true });
  const conversionRate = totalUsers > 0 ? (paidUsersCount / totalUsers) * 100 : 0;

  // Daily revenue chart (last 30 days regardless of filter for chart)
  const chartDays = period === "month" ? 30 : period === "week" ? 7 : 7;
  const chartFrom = new Date(); chartFrom.setDate(chartFrom.getDate() - chartDays); chartFrom.setHours(0,0,0,0);
  const chartOrders = await Order.find({ createdAt: { $gte: chartFrom } }).lean() as any[];
  const dailyRevenue: Record<string, number> = {};
  for (let i = 0; i < chartDays; i++) {
    const d = new Date(chartFrom); d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyRevenue[key] = 0;
  }
  for (const o of chartOrders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (key in dailyRevenue) dailyRevenue[key] += (o.amount ?? 0) / 100;
  }
  const revenueChart = Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount }));

  // All orders in period
  const allOrders = await Order.find(dateFilter).sort({ createdAt: -1 }).lean() as any[];

  return JSON.parse(JSON.stringify({
    revenue, totalCost, paidCost, freeCost, netProfit, margin,
    totalRenders: logs.length, paidRenders: paidLogs.length, freeRenders: freeLogs.length,
    toolUsage, conversionRate, totalUsers, paidUsersCount,
    revenueChart, allOrders,
  }));
}

export async function getPricingSettings() {
  await connectDb();
  let settings = await PricingSettings.findOne().lean() as any;
  if (!settings) settings = await PricingSettings.create({});
  return JSON.parse(JSON.stringify(settings));
}

export async function savePricingSettings(data: {
  starterPrice: number; starterCredits: number; starterDescription: string; starterFeatures: string[];
  proPrice: number; proCredits: number; proDescription: string; proFeatures: string[];
}) {
  await requireAdmin();
  await connectDb();
  await PricingSettings.findOneAndUpdate({}, data, { upsert: true, new: true });
  revalidatePath("/pricing");
  revalidatePath("/secure-7x9/pricing");
}

