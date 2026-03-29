import mongoose, { model, models } from "mongoose";

const AppFramesSchema = new mongoose.Schema({
  key:       { type: String, default: "main", unique: true },
  fallbacks: { type: mongoose.Schema.Types.Mixed, default: {} },
  styles:    { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const AppFrames = models.AppFrames || model("AppFrames", AppFramesSchema);
export default AppFrames;
