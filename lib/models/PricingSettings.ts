import mongoose from "mongoose";

const PricingSettingsSchema = new mongoose.Schema({
  starterPrice:       { type: Number, default: 9.99 },
  starterCredits:     { type: Number, default: 100 },
  starterDescription: { type: String, default: "Great for homeowners and designers working on a project." },
  starterFeatures:    { type: [String], default: ["100 credits — 50 AI renders", "All 4 AI tools included", "HD quality renders", "PNG, JPG & PDF export", "No watermark", "Commercial usage rights", "Priority support"] },
  proPrice:           { type: Number, default: 24.99 },
  proCredits:         { type: Number, default: 300 },
  proDescription:     { type: String, default: "Highest accuracy AI renders powered by StyleAI Pro — for architects, agencies and real estate professionals." },
  proFeatures:        { type: [String], default: ["300 credits — 150 AI renders", "All Starter features", "Isometric & cross-section views", "StyleAI Pro — highest accuracy", "Superior detail & realism", "PNG, JPG & PDF export", "Commercial usage rights", "Priority support"] },
}, { timestamps: true });

const PricingSettings =
  mongoose.models.PricingSettings ||
  mongoose.model("PricingSettings", PricingSettingsSchema);

export default PricingSettings;
