import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { updateProject, getCredits, deductCredit} from "@/lib/actions";
import { ROOMIFY_RENDER_PROMPT } from "@/lib/constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { projectId, imageUrl, userId } = await request.json();

    const credits = await getCredits(userId);
    if (credits <= 0) {
      return NextResponse.json({ error: "No credits left" }, { status: 403 });
    }
    await deductCredit(userId);

    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageUrl.endsWith(".png") ? "image/png" : "image/jpeg";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      } as any,
    });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      ROOMIFY_RENDER_PROMPT,
    ]);

    const parts = result.response.candidates![0].content.parts;
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart) {
      console.error("Gemini returned no image part");
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    const renderedBase64 = `data:image/png;base64,${imagePart.inlineData!.data}`;
    const renderedImageUrl = await uploadImage(renderedBase64, "floo3d/renders");
    await updateProject(projectId, renderedImageUrl);

    return NextResponse.json({ renderedImageUrl });

  } catch (error: any) {
    console.error("Generate error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Generation failed" }, { status: 500 });
  }
}
