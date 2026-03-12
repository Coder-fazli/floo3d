"use server"
import { connectDb } from "./db";
import Project from "./models/Project";
import { uploadImage } from "./cloudinary";
import User from "./models/User";


export async function getProjects(userId: string) {
    await connectDb();
    const projects = await Project.find({ userId }).sort("-createdAt");
    return JSON.parse(JSON.stringify(projects));
}

export async function getLatestRender() {
    await connectDb();
    const project = await Project.findOne({
        renderedImageUrl: { $exists: true, $ne: null },
        originalImageUrl: { $exists: true, $ne: null },
    }).sort("-createdAt");
    return project ? JSON.parse(JSON.stringify(project)) : null;
}

export async function getProject(id: string) {
    await connectDb();
    const project = await Project.findById(id);
    return JSON.parse(JSON.stringify(project));
}

export async function updateProject(id: string, renderedImageUrl: string) {
 await connectDb();
 await Project.findByIdAndUpdate(id, {
    renderedImageUrl, status: "done"
 });
}

// Credit managment for users(Ai generation costs credits)

export async function getCredits(userId: string) {
    await connectDb();
    let user = await User.findOne({ clerkId: userId });
    if(!user) {
        user = await User.create({ clerkId: userId, credits: 10 });
    }
    return user.credits;
}

export async function deductCredit(userId:string) {
    await connectDb();
    await User.findOneAndUpdate(
        { clerkId: userId },
        { $inc: { credits: -1 } }
    );
}
