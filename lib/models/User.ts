import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
    clerkId: { type: String, required: true, unique: true },
    credits: { type: Number, default: 4 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    hasPurchased: { type: Boolean, default: false },
    suspended: { type: Boolean, default: false },
    country: { type: String, default: "" },
    customModel: { type: String, default: null },
    },
{ timestamps: true });

const User = models.User || model("User", UserSchema);

export default User;