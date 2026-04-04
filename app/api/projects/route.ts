 import { NextResponse } from "next/server";                                     
 import { connectDb } from "@/lib/db";                                           
 import Project from "@/lib/models/Project";                                     
 import { uploadImage } from "@/lib/cloudinary";       
 import { auth } from "@clerk/nextjs/server";                          
                
 export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { name, base64Image, inputType = "floor-plan", renderStyle = "Modern" } = await request.json();
     if (base64Image.length > 10_000_000) {
        return NextResponse.json({ error: "Image too large" }, { status: 413 });
     }

    await connectDb();
    const imageUrl = await uploadImage(base64Image, "floo3d/originals");
    const project = await Project.create({
        name,
        userId,
        originalImageUrl: imageUrl,
        inputType,
        renderStyle,
        status: "pending",
    });
     return NextResponse.json(JSON.parse(JSON.stringify(project)));
}