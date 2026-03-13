import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
    clerkId: { type: String, required: true, unique: true },
    credits: { type: Number, default:10 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    name: { type: String, default: "" },
    email: { type: String, default: "" }, 
});

const User = models.User || model("User", UserSchema);

export default User;