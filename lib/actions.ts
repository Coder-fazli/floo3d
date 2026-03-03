"use server"
import { connectDb } from "./db";
import Project from "./models/Project";
import { uploadImage } from "./cloudinary";


export async function getProjects(userId: string) {
    await connectDb();
    const projects = await Project.find({ userId }).sort("-createdAt");
    return JSON.parse(JSON.stringify(projects));
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
