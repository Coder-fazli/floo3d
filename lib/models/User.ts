import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
    clerkId: { type: String, required: true, unique: true },
    credits: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    hasPurchased: { type: Boolean, default: false },
    suspended: { type: Boolean, default: false },
    country: { type: String, default: "" },
    customModel: { type: String, default: null },
    stripeCustomerId:   { type: String, default: null },   
    subscriptionId:     { type: String, default: null },
    subscriptionStatus: { type: String, default: null },   
    subscriptionPlan:   { type: String, default: null }, 
    currentPeriodEnd:   { type: Date,   default: null }, 
    subscriptionCredits:    { type: Number, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelAt: { type: Date, default: null },
    lastInvoiceEventId:     { type: String, default: null },
    signupIp: { type: String, default: null },
    autoTopUp: { type: Boolean, default: false },
    autoTopUpCredits: { type: Number, default: 10 },
    },
    
{ timestamps: true });

UserSchema.index({ signupIp: 1 });

const User = models.User || model("User", UserSchema);
 
export default User;