import mongoose, { Schema, Document } from 'mongoose';

 const PostSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    locale: { type: String, enum: ["en", "ar"], default: "en" },
    content: { type: String, default: '' },
    excerpt: { type: String, default: ''  },
    coverImage: { type: String, default: null },
    tags:       { type: [String], default: [] },
    status:          { type: String, enum: ["draft", "published"], default: "draft" },
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    focusKeyword:    { type: String, default: "" },
    createdAt:       { type: Date, default: Date.now },
    updatedAt:       { type: Date, default: Date.now },
});

PostSchema.index({ status: 1 });
PostSchema.index({ locale: 1 });


const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;