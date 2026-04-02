import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { updateProject, getCredits, deductCredit} from "@/lib/actions";
import { buildPrompt } from "@/lib/prompts";
import Project from "@/lib/models/Project";
import { connectDb } from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const maxDuration = 60;


export async function POST(request: Request) {
  let projectId: string | null = null;
  try {
    const body = await request.json();
    projectId = body.projectId;
    const { imageUrl, userId, inputType = "interior-design", style = "Modern", roomType, viewAngle } = body;

    const credits = await getCredits(userId);
    const isUnlimited = credits >= 99999;
    if (!isUnlimited && credits < 3) {
      return NextResponse.json({ error: "No credits left" }, { status: 403 });
    }
    if (!isUnlimited) await deductCredit(userId);

    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageUrl.endsWith(".png") ? "image/png" : "image/jpeg";

    const model = genAI.getGenerativeModel({
      model: (viewAngle === "isometric" || viewAngle === "crossSection")
        ? "gemini-3-pro-image-preview"        // $0.134/image — better instruction following for isometric & night view
        : "gemini-3.1-flash-image-preview",   // $0.067/image
      // : "gemini-2.5-flash-image",          // $0.039/image — activate when ready
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      } as any,
    });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      buildPrompt({ inputType, style, roomType, viewAngle }),
    ]);

    const parts = result.response.candidates![0].content.parts;
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart) {
      console.error("Gemini returned no image part");
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    } 

    const renderedBase64 = `data:image/png;base64,${imagePart.inlineData!.data}`;
    const renderedImageUrl = await uploadImage(renderedBase64, "floo3d/renders");
    await updateProject(projectId!, renderedImageUrl);
    await connectDb();
    await Project.findByIdAndUpdate(projectId, { $inc: {
      generationCount: 1
    } });

    return NextResponse.json({ renderedImageUrl });

  } catch (error: any) {
    console.error("Generate error:", error?.message || error);
    if (projectId) {
      try {
        await connectDb();
        await Project.findByIdAndUpdate(projectId, {
          status: "error",
          errorMessage: error?.message || "Generation failed",
        });
      } catch {}
    }
    return NextResponse.json({ error: error?.message || "Generation failed" }, { status: 500 });
  }
}
