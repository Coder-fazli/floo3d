 import { GoogleGenerativeAI } from "@google/generative-ai";
  import { NextResponse } from "next/server";
  import { uploadImage } from "@/lib/cloudinary";
  import { getCredits, deductCredit } from "@/lib/actions";
  import { buildFloorPlanGeneratorPrompt, FloorPlanGeneratorConfig }
   from "@/lib/prompts/floor-plan-generator";
  import { connectDb } from "@/lib/db";
import Project from "@/lib/models/Project";
import { auth } from "@clerk/nextjs/server";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await request.json();
        const { config }: { config: FloorPlanGeneratorConfig } = body;

       // We Check Credits
        const credits = await getCredits(userId);
        const isUnlimited = credits >= 99999;
        if (!isUnlimited && credits < 3) {
            return NextResponse.json({ error: "No credits left" }, { status: 403 });
        }
        if(!isUnlimited) await deductCredit(userId);


     // Build prompt 
      const prompt = buildFloorPlanGeneratorPrompt(config);
      
      // Call Gemini API
        const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-image-preview",
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        } as any, 
      });

     const result = await model.generateContent([prompt]);
     const parts = result.response.candidates?.[0]?.content?.parts;
     const imagePart = parts?.find((p: any) => p.inlineData);

      if (!imagePart) {
        return NextResponse.json({ error: "No image generated" }, {
  status: 500 });
      }

      const renderedBase64 = `data:image/png;base64,${imagePart.inlineData!.data}`;
      const renderedImageUrl = await uploadImage(renderedBase64, "floo3d/floor-plans");

        await connectDb();
        const project = await Project.create({
            userId,
            name: `${config.propertyType} Floor Plan`,
            originalImageUrl: renderedImageUrl,
            renderedImageUrl,
            inputType: "floor-plan-generator",
            renderStyle: config.style,
            status: "done",
            generationCount: 1,
        });

        return NextResponse.json({
            renderedImageUrl, projectId: project._id
        });
    }  catch (error: any) {
        console.error("Floor Plan Generator Error", error?.message || error);
        return NextResponse.json({ error: error?.message||"Failed to generate floor plan" }, { status: 500 });
    }
}