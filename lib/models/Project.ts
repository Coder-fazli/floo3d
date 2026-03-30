import mongoose, { Schema, models, model } from "mongoose";

const ProjectSchema = new Schema({                                    
    userId: { type: String, required: true },                           
    name: { type: String, required: true },
    originalImageUrl: { type: String, required: true },
    renderedImageUrl: { type: String, default: null },
    inputType: { type: String, default: "floor-plan" },
    renderStyle: { type: String, default: "Modern" },
    status: { type: String, default: "pending" },
    errorMessage: { type: String, default: null },
    generationCount: { type: Number, default: 0 },
    downloadedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  });

  const Project = models.Project || model("Project", ProjectSchema);

  export default Project;