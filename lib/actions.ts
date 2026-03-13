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

export async function getCredits(userId: string, name?: 
  string, email?: string) {
    await connectDb();
    const user = await User.findOneAndUpdate(
        { clerkId: userId },
        { $setOnInsert: { credits: 10, name: name ?? "", email: email ?? "" } },
        { upsert: true, new: true }
    );
    return user.credits;
}

export async function deductCredit(userId:string) {
    await connectDb();
    await User.findOneAndUpdate(
        { clerkId: userId },
        { $inc: { credits: -1 } }
    );
}

// Ф
export async function getAllUSers() {
    await connectDb();
    const users = await User.find({}).sort("-createdAt");
    return JSON.parse(JSON.stringify(users));
}

export async function updateUserCredits(clerkId: string, credits: number) {
    await connectDb();
    await User.findOneAndUpdate({ clerkId }, { credits });
}

export async function deleteUSer(clerkId: string) {
    await connectDb();
    await User.findOneAndDelete({ clerkId });
}

