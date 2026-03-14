import mongoose, { model, models } from "mongoose";

const SiteSettingsSchema = new mongoose.Schema({
   key: { type: String, required: true, unique: true },
   metaTitle: { type: String, default: "Transform any 2D floor plan into a stunning 3D render in seconds."}, 
},
 { timestamps: true });

 const SiteSettings = models.SiteSettings || model("SiteSettings", SiteSettingsSchema);

 export default SiteSettings;
