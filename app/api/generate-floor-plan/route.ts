import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { getCredits, deductCredit, refundCredit } from "@/lib/actions";
import User from "@/lib/models/User";
import { buildFloorPlanGeneratorPrompt, FloorPlanGeneratorConfig }
 from "@/lib/prompts/floor-plan-generator";
import { connectDb } from "@/lib/db";
import Project from "@/lib/models/Project";
import GenerationLog from "@/lib/models/GenerationLog";
import { auth } from "@clerk/nextjs/server";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const maxDuration = 60;

export async function POST(request: Request) {
    let modelName = "gemini-3.1-flash-image-preview";
    const startTime = Date.now();
    let creditDeducted = false;

    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await request.json();
        const { config, customPrompt = "" }: { config: FloorPlanGeneratorConfig; customPrompt?: string } = body;

        await connectDb();
        const userDoc = await User.findOne({ clerkId: userId }, { suspended: 1, subscriptionStatus: 1 }).lean() as any;
        if (userDoc?.suspended) return NextResponse.json({ error: "suspended" }, { status: 403 });
        if (userDoc?.subscriptionStatus && userDoc.subscriptionStatus !== "active") return NextResponse.json({ error: "Subscription not active" }, { status: 403 });

       // We Check Credits
        const credits = await getCredits(userId);
        const isUnlimited = credits >= 99999;
        if (!isUnlimited) {
          const ok = await deductCredit(userId);
          if (!ok) return NextResponse.json({
            error: "No credits left" }, { status: 403 
          });
          creditDeducted = true
        }


     // Build prompt
      const prompt = buildFloorPlanGeneratorPrompt(config, customPrompt);

      // Call Gemini API
        const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        } as any,
      });

     const result = await model.generateContent([prompt]);
     const parts = result.response.candidates?.[0]?.content?.parts;
     const imagePart = parts?.find((p: any) => p.inlineData);

      if (!imagePart) {
        if (creditDeducted) await refundCredit(userId);
        await connectDb();
        await GenerationLog.create({
          userId,
          inputType: "floor-plan-generator",
          model: modelName,
          status: "error",
          duration: Date.now() - startTime,
          errorMessage: "Gemini returned no image part",
        });
        return NextResponse.json({ error: "No image generated" }, { status: 500 });
      }

      const renderedBase64 = `data:image/png;base64,${imagePart.inlineData!.data}`;
      const renderedImageUrl = await uploadImage(renderedBase64, "floo3d/floor-plans");

        await connectDb();
        const [project] = await Promise.all([
          Project.create({
            userId,
            name: `${config.propertyType} Floor Plan`,
            originalImageUrl: renderedImageUrl,
            renderedImageUrl,
            inputType: "floor-plan-generator",
            renderStyle: config.style,
            status: "done",
            generationCount: 1,
          }),
          GenerationLog.create({
            userId,
            inputType: "floor-plan-generator",
            model: modelName,
            status: "success",
            duration: Date.now() - startTime,
          }),
        ]);

        return NextResponse.json({
            renderedImageUrl, projectId: project._id
        });
    }  catch (error: any) {
        console.error("Floor Plan Generator Error", error?.message || error);
        try {
          const { userId } = await auth();
          if (userId) {
            if (creditDeducted) await refundCredit(userId);
            await connectDb();
            await GenerationLog.create({
              userId,
              inputType: "floor-plan-generator",
              model: modelName,
              status: "error",
              duration: Date.now() - startTime,
              errorMessage: error?.message || "Generation failed",
            });
          }
        } catch {}
        return NextResponse.json({ error: error?.message||"Failed to generate floor plan" }, { status: 500 });
    }
}
