import mongoose from "mongoose";

const CampaignLogSchema = new mongoose.Schema({
    audience:  { type: String, required: true },
    subject:   { type: String, required: true },
    sent:      { type: Number, required: true },
    sentBy:    { type: String },
}, { timestamps: true });

const CampaignLog = mongoose.models.CampaignLog || mongoose.model("CampaignLog", CampaignLogSchema);
export default CampaignLog;
