 import { NextResponse } from "next/server";                                     
 import { connectDb } from "@/lib/db";                                           
 import Project from "@/lib/models/Project";                                     
 import { uploadImage } from "@/lib/cloudinary";                                 
                                                   


 export async function POST(request: Request) {
    const { name, userId, base64Image, inputType = "floor-plan", renderStyle = "Modern" } = await request.json();
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