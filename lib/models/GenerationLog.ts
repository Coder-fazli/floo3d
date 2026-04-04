import mongoose from "mongoose";

const GenerationLogSchema = new mongoose.Schema(
  {
    userId:     { type: String, required: true },
    inputType:  { type: String, required: true },
    model:      { type: String, required: true },
    status:     { type: String, enum: ["success", "error"], required: true },
    duration:   { type: Number }, // ms
    errorMessage: { type: String },
  },
  { timestamps: true }
);

const GenerationLog =
  mongoose.models.GenerationLog ||
  mongoose.model("GenerationLog", GenerationLogSchema);

export default GenerationLog;
