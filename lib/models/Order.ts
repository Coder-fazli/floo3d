import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    email:  { type: String },
    plan:   { type: String },
    amount: { type: Number },
    credits: { type: Number },
    stripeSessionId: { type: String, unique: true },
}, { timestamps: true })

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;