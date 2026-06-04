"use server"
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "./db";
import { uploadImage } from "./cloudinary";
import { unstable_noStore as noStore } from "next/cache";
import mongoose from "mongoose";
import Stripe from "stripe";
import User from "./models/User";
import Project from "./models/Project";
import SiteSettings from "./models/SiteSettings";
import AppFrames from "./models/AppFrames";
import GenerationLog from "./models/GenerationLog";
import Order from "./models/Order";
import PricingSettings from "./models/PricingSettings";
import Post from "./models/Posts";

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

// Toggle whether a render is featured on the public showcase (and Pinterest feed).
export async function setProjectFeatured(projectId: string, featured: boolean) {
  await requireAdmin();
  await connectDb();
  const project = await Project.findById(projectId).select("renderedImageUrl status").lean() as any;
  if (!project) throw new Error("Project not found");
  // Only a finished render can be featured.
  if (featured && (!project.renderedImageUrl || project.status === "error")) {
    throw new Error("Only completed renders can be featured");
  }
  await Project.findByIdAndUpdate(projectId, {
    featured,
    featuredAt: featured ? new Date() : null,
  });
  revalidatePath("/secure-7x9/projects");
  revalidatePath("/showcase");
  return { ok: true, featured };
}

export async function getAllUSers() {
  await requireAdmin();
  noStore();
  await connectDb();
  const users = await User.find({}, { clerkId: 1, name: 1, email: 1, imageUrl: 1, credits: 1, hasPurchased: 1, suspended: 1, country: 1, createdAt: 1 }).sort("-createdAt").lean();

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

export async function updateUserModel(clerkId: string, model: string | null) {
  await requireAdmin();
  await connectDb();
  await User.findOneAndUpdate({ clerkId }, { customModel: model || null });
}

export async function deleteUSer(clerkId: string) {
  await requireAdmin();
  await connectDb();
  await User.findOneAndDelete({ clerkId });
}

export async function suspendUser(clerkId: string, suspended: boolean) {
  await requireAdmin();
  await connectDb();
  await User.findOneAndUpdate({ clerkId }, { suspended });
}

// ─── General Settings ──────────────────────────────────────────────────────────

export async function saveGeneralSettings(siteName: string, supportEmail: string) {
  await requireAdmin();
  await connectDb();
  await SiteSettings.findOneAndUpdate(
    { key: "home" },
    { siteName, supportEmail },
    { upsert: true, new: true }
  );
}

export async function saveLogoImage(base64: string, type: "logo" | "favicon") {
  await requireAdmin();
  await connectDb();
  const url = await uploadImage(base64, "branding");
  const field = type === "logo" ? "logoUrl" : "faviconUrl";
  await SiteSettings.findOneAndUpdate({ key: "home" }, { [field]: url }, { upsert: true, new: true });
  return url;
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
  category: "fallback" | "style" | "angle" | "roomType",
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
  } else if (category === "roomType") {
    const roomTypes = { ...(doc.roomTypes ?? {}), [key]: url };
    doc.roomTypes = roomTypes;
    doc.markModified("roomTypes");
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

  const downloadDateFilter = from ? { downloadedAt: { $gte: from, $lte: to } } : { downloadedAt: { $ne: null } };

  const [
    totalUsers, newUsers,
    totalProjects, newRenders,
    errors, orders,
    recentRenders, recentErrors, recentPurchases,
    recentlyActive,
    downloads,
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
    Project.countDocuments(downloadDateFilter),
  ]);

  const revenue = orders.reduce((s: number, o: any) => s + (o.amount ?? 0), 0);

  return JSON.parse(JSON.stringify({
    totalUsers, newUsers,
    totalProjects, newRenders,
    errors, revenue,
    recentRenders, recentErrors, recentPurchases,
    recentlyActive,
    downloads,
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

export async function getBusinessAnalytics(period: string, userType: "all" | "free" | "paid" = "all") {
  await connectDb();
  const { from, to, dateFilter } = getDateRange(period);

  // Get all paid user IDs (lifetime)
  const paidUsers = await User.find({ hasPurchased: true }).distinct("clerkId");
  const paidSet = new Set(paidUsers);

  // Get all successful logs in period
  const allLogs = await GenerationLog.find({ ...dateFilter, status: "success" }).lean() as any[];
  const allPaidLogs = allLogs.filter((l: any) => paidSet.has(l.userId));
  const allFreeLogs = allLogs.filter((l: any) => !paidSet.has(l.userId));

  // Apply userType filter to the active log set
  const logs     = userType === "paid" ? allPaidLogs : userType === "free" ? allFreeLogs : allLogs;
  const paidLogs = userType === "free" ? [] : allPaidLogs;
  const freeLogs = userType === "paid" ? [] : allFreeLogs;

  // Calculate AI costs
  const calcCost = (ls: any[]) => ls.reduce((sum, l) => sum + (MODEL_COSTS[l.model] ?? 0.067), 0);
  const paidCost  = calcCost(allPaidLogs);
  const freeCost  = calcCost(allFreeLogs);
  const totalCost = calcCost(logs);

  // Cash revenue: orders placed in this period
  const orders = await Order.find(dateFilter).lean() as any[];
  const revenue = orders.reduce((s: number, o: any) => s + (o.amount ?? 0), 0) / 100;

  // Recognized revenue: attribute credit value at render time
  const paidUserIds = [...new Set(paidLogs.map((l: any) => l.userId))];
  const userOrders = paidUserIds.length > 0
    ? await Order.find({ userId: { $in: paidUserIds } }).sort({ createdAt: 1 }).lean() as any[]
    : [];

  const userTotalPaid: Record<string, number> = {};
  const userTotalCredits: Record<string, number> = {};
  for (const o of userOrders) {
    if (o.userId && o.credits > 0 && o.amount > 0) {
      userTotalPaid[o.userId]    = (userTotalPaid[o.userId]    ?? 0) + o.amount / 100;
      userTotalCredits[o.userId] = (userTotalCredits[o.userId] ?? 0) + o.credits;
    }
  }
  const pricePerCredit: Record<string, number> = {};
  for (const uid of Object.keys(userTotalPaid)) {
    pricePerCredit[uid] = userTotalPaid[uid] / userTotalCredits[uid];
  }

  // Each render costs 2 credits, so recognized revenue per render = pricePerCredit × 2
  const recognizedRevenue = paidLogs.reduce((sum: number, l: any) => {
    return sum + (pricePerCredit[l.userId] ?? 0) * 2;
  }, 0);

  const netProfit = recognizedRevenue - totalCost;
  const margin    = recognizedRevenue > 0 ? (netProfit / recognizedRevenue) * 100 : 0;

  // Tool usage breakdown (filtered by userType)
  const toolCounts: Record<string, number> = {};
  for (const l of logs) {
    toolCounts[l.inputType] = (toolCounts[l.inputType] ?? 0) + 1;
  }
  const toolUsage = Object.entries(toolCounts)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count);

  // Conversion rate — period-specific user counts
  const userDateFilter = from ? { createdAt: { $gte: from, $lte: to } } : {};
  const totalUsers     = await User.countDocuments(userDateFilter);
  const paidUsersCount = await User.countDocuments({ ...userDateFilter, hasPurchased: true });
  const conversionRate = totalUsers > 0 ? (paidUsersCount / totalUsers) * 100 : 0;

  // Revenue chart — scoped to the selected period
  const isHourly = period === "today" || period === "yesterday";
  const chartOrders = await Order.find(from ? { createdAt: { $gte: from, $lte: to } } : {}).lean() as any[];
  const revenueChart: { date: string; amount: number }[] = [];

  if (isHourly) {
    // 24 hourly buckets
    for (let h = 0; h < 24; h++) {
      const slot = new Date(from!); slot.setHours(h, 0, 0, 0);
      const key = `${slot.toISOString().slice(0, 10)}T${String(h).padStart(2, "0")}`;
      revenueChart.push({ date: key, amount: 0 });
    }
    for (const o of chartOrders) {
      const h = new Date(o.createdAt).getHours();
      revenueChart[h].amount += (o.amount ?? 0) / 100;
    }
  } else {
    const chartDays = period === "month" ? 30 : 7;
    const chartFrom = from ?? new Date(new Date().setDate(new Date().getDate() - chartDays));
    for (let i = 0; i < chartDays; i++) {
      const d = new Date(chartFrom); d.setDate(d.getDate() + i);
      revenueChart.push({ date: d.toISOString().slice(0, 10), amount: 0 });
    }
    for (const o of chartOrders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const slot = revenueChart.find(r => r.date === key);
      if (slot) slot.amount += (o.amount ?? 0) / 100;
    }
  }

  // All orders in period
  const allOrders = await Order.find(dateFilter).sort({ createdAt: -1 }).lean() as any[];

  return JSON.parse(JSON.stringify({
    revenue, recognizedRevenue, totalCost, paidCost, freeCost, netProfit, margin,
    totalRenders: logs.length, paidRenders: allPaidLogs.length, freeRenders: allFreeLogs.length,
    toolUsage, conversionRate, totalUsers, paidUsersCount,
    revenueChart, isHourly, allOrders,
  }));
}

export async function backfillSubscriptionOrders(): Promise<{ created: number; skipped: number }> {
  await requireAdmin();
  await connectDb();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Build a clerkId + email lookup keyed by stripeCustomerId
  const users = await User.find(
    { stripeCustomerId: { $exists: true, $ne: null } },
    { clerkId: 1, email: 1, stripeCustomerId: 1, subscriptionPlan: 1, subscriptionCredits: 1 }
  ).lean() as any[];

  const byCustomer: Record<string, any> = {};
  for (const u of users) byCustomer[u.stripeCustomerId] = u;

  // Fetch pricing once before the loop
  const pricing: any = await PricingSettings.findOne().lean() ?? {};
  const PLAN_CREDITS: Record<string, number> = {
    starter: pricing.starterCredits ?? 100,
    pro: pricing.proCredits ?? 300,
    elite: pricing.eliteCredits ?? 300,
  };

  let created = 0;
  let skipped = 0;

  // Page through all paid invoices on Stripe
  for await (const invoice of stripe.invoices.list({ status: "paid", limit: 100 })) {
    const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
    if (!customerId) { skipped++; continue; }

    const user = byCustomer[customerId];
    if (!user) { skipped++; continue; }

    const amountPaid = invoice.amount_paid ?? 0;
    if (amountPaid <= 0) { skipped++; continue; }

    const credits = user.subscriptionPlan === "custom"
      ? (user.subscriptionCredits ?? 0)
      : PLAN_CREDITS[user.subscriptionPlan] ?? 0;

    const existing = await Order.findOne({ stripeSessionId: invoice.id }).lean();
    if (existing) { skipped++; continue; }

    // Use collection.insertOne() so Mongoose doesn't override createdAt with today's date
    const invoiceDate = new Date(invoice.created * 1000);
    await Order.collection.insertOne({
      _id: new mongoose.Types.ObjectId(),
      userId: user.clerkId,
      email: user.email ?? invoice.customer_email ?? "",
      plan: user.subscriptionPlan,
      amount: amountPaid,
      credits,
      stripeSessionId: invoice.id,
      currency: invoice.currency,
      createdAt: invoiceDate,
      updatedAt: invoiceDate,
    });
    created++;
  }

  return { created, skipped };
}

export async function getPricingSettings() {
  await connectDb();
  let settings = await PricingSettings.findOne().lean() as any;
  if (!settings) settings = await PricingSettings.create({});
  const result = JSON.parse(JSON.stringify(settings));
  // Ensure array fields are never undefined for old documents missing new fields
  result.starterFeatures = result.starterFeatures ?? [];
  result.proFeatures     = result.proFeatures ?? [];
  result.eliteFeatures   = result.eliteFeatures ?? [];
  return result;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getAllPosts() {
  await requireAdmin();
  noStore();
  await connectDb();
  const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(posts));
}

export async function getPostById(id: string) {
  await requireAdmin();
  await connectDb();
  const post = await Post.findById(id).lean();
  return post ? JSON.parse(JSON.stringify(post)) : null;
}

export async function savePricingSettings(data: {
  starterPrice: number; starterCredits: number; starterDescription: string; starterFeatures: string[];
  proPrice: number; proCredits: number; proDescription: string; proFeatures: string[];
  elitePrice: number; eliteCredits: number; eliteDescription: string; eliteFeatures: string[];
  saleEnabled?: boolean; saleDiscount?: number; saleEndDate?: string | null;
  customPackEnabled?: boolean;
}) {
  await requireAdmin();
  await connectDb();
  await PricingSettings.findOneAndUpdate({}, data, { upsert: true, new: true });
  revalidatePath("/pricing");
  revalidatePath("/secure-7x9/pricing");
}

