import mongoose, { model, models } from "mongoose";

const SiteSettingsSchema = new mongoose.Schema({
   key: { type: String, required: true, unique: true },
   metaTitle: { type: String, default: "Floo3D – Convert 2D Floor Plans to 3D Renders with AI" },
   metaDescription: { type: String, default: "Upload any 2D floor plan and get a photorealistic 3D render in under 60 seconds. Free to start. No 3D software needed. Used by architects, designers & real estate pros." },
   floorPlanMetaTitle: { type: String, default: "2D to 3D Floor Plan Converter — Convert 2D Floor Plan to 3D Model Free Online" },
   floorPlanMetaDescription: { type: String, default: "Convert 2D floor plans to 3D models free online — no credit card, no login required. Works with blueprints, house plans & hand-drawn sketches. Results in seconds." },
   // Hero slider images
   heroBeforeUrl: { type: String, default: null },
   heroAfterUrl: { type: String, default: null },
   // LIMITLESS TRANSFORMATIONS section images: { "01": { before, after }, ... }
   transformImages: { type: mongoose.Schema.Types.Mixed, default: {} },
},
 { timestamps: true });

 const SiteSettings = models.SiteSettings || model("SiteSettings", SiteSettingsSchema);

 export default SiteSettings;
