import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function connectDb() {
    if (mongoose.connection.readyState >=1) return;
    await mongoose.connect(process.env.MONGODB_URI!);
}