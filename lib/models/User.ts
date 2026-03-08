import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
    clerkId: { type: String, required: true, unique: true },
    credits: { type: Number, default:10 },
});

const User = models.User || model("User", UserSchema);

export default User;