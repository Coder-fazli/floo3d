import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { updateProject, getCredits, deductCredit} from "@/lib/actions";
import { ROOMIFY_RENDER_PROMPT } from "@/lib/constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const { projectId, imageUrl, userId } = await request.json();

// We need to check if user ahs enogh credits before generating the design
 const credits = await getCredits(userId);
 if(credits <= 0) {
  return NextResponse.json({ error: "No credits left" }, { status: 403 });
 }
 await deductCredit(userId);
  // fetch the original image and convert to base64
  const imageResponse = await fetch(imageUrl);
  const buffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = imageUrl.endsWith(".png") ? "image/png" : "image/jpeg";

  // send to Gemini
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
    } as any,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
    ROOMIFY_RENDER_PROMPT,
  ]);

  // get generated image from Gemini response
  const parts = result.response.candidates![0].content.parts;
  const imagePart = parts.find((p: any) => p.inlineData);

  if (!imagePart) {
    return NextResponse.json({ error: "No image generated" }, { status: 500 });
  }

  const renderedBase64 = `data:image/png;base64,${imagePart.inlineData!.data}`;

  // upload rendered image to Cloudinary
  const renderedImageUrl = await uploadImage(renderedBase64, "floo3d/renders");

  // save to MongoDB
  await updateProject(projectId, renderedImageUrl);

  return NextResponse.json({ renderedImageUrl });
}
