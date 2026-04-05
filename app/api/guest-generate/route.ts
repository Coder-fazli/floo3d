import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const maxDuration = 60;

// Simple in-memory rate limiter: 5 requests per IP per hour
const ipRequests = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Try again in an hour." }, { status: 429 });
    }

    const {
      base64Image,
      renderStyle = "Modern",
      roomType = "Living Room",
      inputType = "floor-plan",
    } = await request.json();


    if (!base64Image || base64Image.length > 10_000_000)
  {  return NextResponse.json({ error: "No image provided or image too large" }, { status: 400 });
  }

    const mimeMatch = base64Image.match(/^data:(image\/[\w+]+);base64,/);
    const mimeType = (mimeMatch?.[1] as string) || "image/jpeg";
    const base64 = base64Image.replace(/^data:image\/[\w+]+;base64,/, "");

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-image-preview", // $0.067/image
      // model: "gemini-2.5-flash-image",       // $0.039/image — activate when ready
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] } as any,
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

    return NextResponse.json({
      renderedBase64: `data:image/png;base64,${imagePart.inlineData!.data}`,
    });

  } catch (error: any) {
    console.error("Guest generate error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Generation failed" }, { status: 500 });
  }
}
