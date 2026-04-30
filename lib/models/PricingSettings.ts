import mongoose from "mongoose";

const PricingSettingsSchema = new mongoose.Schema({
  starterPrice:       { type: Number, default: 9.99 },
  starterCredits:     { type: Number, default: 100 },
  starterDescription: { type: String, default: "Great for homeowners and designers working on a project." },
  starterFeatures:    { type: [String], default: ["100 credits — 50 AI renders", "All 4 AI tools included", "HD quality renders", "PNG, JPG & PDF export", "No watermark", "Commercial usage rights", "Priority support"] },
  proPrice:           { type: Number, default: 24.99 },
  proCredits:         { type: Number, default: 300 },
  proDescription:     { type: String, default: "Great value for homeowners and designers who need professional results fast." },
  proFeatures:        { type: [String], default: ["300 credits — 150 AI renders", "All Starter features", "Isometric & cross-section views", "HD quality renders", "PNG, JPG & PDF export", "No watermark", "Commercial usage rights", "Priority support"] },
  elitePrice:         { type: Number, default: 49.99 },
  eliteCredits:       { type: Number, default: 300 },
  eliteDescription:   { type: String, default: "Highest accuracy AI — for architects, agencies and real estate professionals who demand the best." },
  eliteFeatures:      { type: [String], default: ["300 credits — 150 AI renders", "All Pro features included", "Highest accuracy AI model", "Superior material & texture detail", "More realistic lighting & shadows", "Sharper architectural lines", "Best for client presentations", "Commercial usage rights", "Priority support"] },
  topUpPricePerCredit: { type: Number, default: 0.5 },
}, { timestamps: true });

const PricingSettings =
  mongoose.models.PricingSettings ||
  mongoose.model("PricingSettings", PricingSettingsSchema);

export default PricingSettings;
