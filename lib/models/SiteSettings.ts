import mongoose, { model, models } from "mongoose";

const SiteSettingsSchema = new mongoose.Schema({
   key: { type: String, required: true, unique: true },
   metaTitle: { type: String, default: "Floo3D – Convert 2D Floor Plans to 3D Renders with AI" },
   metaDescription: { type: String, default: "Upload any 2D floor plan and get a photorealistic 3D render in under 60 seconds. Free to start. No 3D software needed. Used by architects, designers & real estate pros." },
},
 { timestamps: true });

 const SiteSettings = models.SiteSettings || model("SiteSettings", SiteSettingsSchema);

 export default SiteSettings;
