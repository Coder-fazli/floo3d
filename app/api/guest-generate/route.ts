import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      base64Image,
      renderStyle = "Modern",
      roomType = "Living Room",
      inputType = "floor-plan",
    } = await request.json();

    if (!base64Image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Strip data URL prefix to get raw base64 + detect mime type
    const mimeMatch = base64Image.match(/^data:(image\/[\w+]+);base64,/);
    const mimeType = (mimeMatch?.[1] as string) || "image/jpeg";
    const base64 = base64Image.replace(/^data:image\/[\w+]+;base64,/, "");

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-image-preview",
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      } as any,
    });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      buildPrompt({ inputType, style: renderStyle, roomType }),
    ]);

    const parts = result.response.candidates![0].content.parts;
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    const renderedBase64 = `data:image/png;base64,${imagePart.inlineData!.data}`;
    return NextResponse.json({ renderedBase64 });

  } catch (error: any) {
    console.error("Guest generate error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Generation failed" }, { status: 500 });
  }
}
