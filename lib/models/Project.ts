import mongoose, { Schema, models, model } from "mongoose";

const ProjectSchema = new Schema({                                    
    userId: { type: String, required: true },                           
    name: { type: String, required: true },
    originalImageUrl: { type: String, required: true },                 
    renderedImageUrl: { type: String, default: null },      
    status: { type: String, default: "pending" },                       
    createdAt: { type: Date, default: Date.now },
  });

  const Project = models.Project || model("Project", ProjectSchema);

  export default Project;