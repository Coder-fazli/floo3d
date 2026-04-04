import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { updateProject, getCredits, deductCredit, getModelSettings } from "@/lib/actions";
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

    const credits = await getCredits(userId);
    const isUnlimited = credits >= 99999;
    if (!isUnlimited && credits < 2) {
      return NextResponse.json({ error: "No credits left" }, { status: 403 });
    }
    if (!isUnlimited) await deductCredit(userId);

    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageUrl.endsWith(".png") ? "image/png" : "image/jpeg";

    const modelSettings = await getModelSettings();
    const isSpecialAngle = viewAngle === "isometric" || viewAngle === "crossSection";
    modelName = isSpecialAngle
      ? (modelSettings["isometric"] ?? "gemini-3-pro-image-preview")
      : (modelSettings[inputType] ?? "gemini-3.1-flash-image-preview");

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      } as any,
    });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      buildPrompt({ inputType, style, roomType, viewAngle }),
    ]);

    const parts = result.response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((p: any) => p.inlineData);

    if (!imagePart) {
      console.error("Gemini returned no image part");
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
    await updateProject(projectId!, renderedImageUrl);
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
