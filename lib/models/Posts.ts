import mongoose, { Schema, Document } from 'mongoose';

 const PostSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, default: '' },
    excerpt: { type: String, default: ''  },
    coverImage: { type: String, default: null }, 
    tags:       { type: [String], default: [] },
    status:     { type: String, enum: ["draft", "published"],
    default: "draft" },
    createdAt:  { type: Date, default: Date.now },
    updatedAt:  { type: Date, default: Date.now },
});

PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1 });


const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;