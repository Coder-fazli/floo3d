import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { updateProject, getCredits, deductCredit, getModelSettings, getUserInfo } from "@/lib/actions";
import User from "@/lib/models/User";
import { buildPrompt } from "@/lib/prompts";
import Project from "@/lib/models/Project";
import GenerationLog from "@/lib/models/GenerationLog";
import { connectDb } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const maxDuration = 60;


export async function POST(request: Request) {
  let projectId: string | null = null;
  let modelName = "gemini-3.1-flash-image-preview";
  let resolvedInputType = "interior-design";
  const startTime = Date.now();

  try {
     const { userId } = await auth();
     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    projectId = body.projectId;

    const { imageUrl, inputType = "interior-design", style = "Modern", roomType, viewAngle } = body;
    resolvedInputType = viewAngle === "isometric" || viewAngle === "crossSection" ? "isometric" : inputType;

    // Validate ImageUrl
    if (!imageUrl || !imageUrl.startsWith("https://res.cloudinary.com/"))
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });

    await connectDb();
    const userDoc = await User.findOne({ clerkId: userId }, { suspended: 1, credits: 1 }).lean() as any;
    if (userDoc?.suspended) return NextResponse.json({ error: "suspended" }, { status: 403 });

    const credits = await getCredits(userId);
    const isUnlimited = credits >= 99999;
    if (!isUnlimited && credits < 2) {
      return NextResponse.json({ error: "No credits left" }, { status: 403 });
    }
    if (!isUnlimited) await deductCredit(userId);

    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    // Detect mimeType from response headers, not from URL (Cloudinary URLs often have no extension)
    const contentType = imageResponse.headers.get("content-type") ?? "";
    const mimeType: "image/png" | "image/jpeg" = contentType.includes("png") ? "image/png" : "image/jpeg";

    const [modelSettings, userInfo] = await Promise.all([getModelSettings(), getUserInfo(userId)]);
    const isSpecialAngle = viewAngle === "isometric" || viewAngle === "crossSection";

    if (userInfo.hasPurchased) {
      // Paid users get better models automatically
      modelName = isSpecialAngle ? "gemini-3-pro-image-preview" : "gemini-3.1-flash-image-preview";
    } else {
      modelName = isSpecialAngle
        ? (modelSettings["isometric"] ?? "gemini-3-pro-image-preview")
        : (modelSettings[inputType] ?? "gemini-3.1-flash-image-preview");
    }

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      } as any,
    });

    const prompt = buildPrompt({ inputType, style, roomType, viewAngle });

    // Try up to 2 times — Gemini occasionally returns no image on first attempt
    let imagePart: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const result = await model.generateContent([
        { inlineData: { data: base64, mimeType } },
        prompt,
      ]);
      const parts = result.response.candidates?.[0]?.content?.parts;
      imagePart = parts?.find((p: any) => p.inlineData);
      if (imagePart) break;
      const textPart = parts?.find((p: any) => p.text);
      console.warn(`Gemini attempt ${attempt} returned no image. Text: ${textPart?.text ?? "(none)"}`);
    }

    if (!imagePart) {
      console.error("Gemini returned no image part after 2 attempts");
      await connectDb();
      await GenerationLog.create({
        userId,
        inputType: resolvedInputType,
        model: modelName,
        status: "error",
        duration: Date.now() - startTime,
        errorMessage: "Gemini returned no image part",
      });
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    const renderedBase64 = `data:image/png;base64,${imagePart.inlineData!.data}`;
    const renderedImageUrl = await uploadImage(renderedBase64, "floo3d/renders");
    await updateProject(projectId!, renderedImageUrl, style, roomType);
    await connectDb();
    await Promise.all([
      Project.findByIdAndUpdate(projectId, { $inc: { generationCount: 1 } }),
      GenerationLog.create({
        userId,
        inputType: resolvedInputType,
        model: modelName,
        status: "success",
        duration: Date.now() - startTime,
      }),
    ]);

    return NextResponse.json({ renderedImageUrl });

  } catch (error: any) {
    console.error("Generate error:", error?.message || error);
    try {
      const { userId } = await auth();
      await connectDb();
      await Promise.all([
        projectId
          ? Project.findByIdAndUpdate(projectId, {
              status: "error",
              errorMessage: error?.message || "Generation failed",
            })
          : Promise.resolve(),
        userId
          ? GenerationLog.create({
              userId,
              inputType: resolvedInputType,
              model: modelName,
              status: "error",
              duration: Date.now() - startTime,
              errorMessage: error?.message || "Generation failed",
            })
          : Promise.resolve(),
      ]);
    } catch {}
    return NextResponse.json({ error: error?.message || "Generation failed" }, { status: 500 });
  }
}
