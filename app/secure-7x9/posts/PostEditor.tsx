"use client";
import "./editor.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, FileCode,
  Link as LinkIcon, Image as ImageIcon, Minus, Undo, Redo, Save, Send,
  Eye, FileText, X, Tag, Check, Loader2, Upload,
} from "lucide-react";

interface PostData {
  _id?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  status?: "draft" | "published";
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`pe-toast pe-toast-${type}`}>
      {type === "success" ? <Check size={15} /> : <X size={15} />}
      {msg}
    </div>
  );
}

export default function PostEditor({ post }: { post?: PostData }) {
  const router = useRouter();
  const isEdit = !!post?._id;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [linkDialog, setLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imgDialog, setImgDialog] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [metaTitle, setMetaTitle]           = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [focusKeyword, setFocusKeyword]     = useState(post?.focusKeyword ?? "");
  const slugEditedRef = useRef(isEdit);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [uploadingBodyImg, setUploadingBodyImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgFileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Start writing your post content here..." }),
    ],
    content: post?.content ?? "",
    editorProps: {
      attributes: { class: "tiptap" },
    },
    onUpdate: () => setIsDirty(true),
  });

  // Warn on browser close / reload when dirty
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Auto-generate slug from title only if user hasn't manually edited it
  useEffect(() => {
    if (!slugEditedRef.current && title) setSlug(toSlug(title));
  }, [title]);

  const wordCount = editor?.getText().split(/\s+/).filter(Boolean).length ?? 0;

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
  }, []);

  const handleSave = useCallback(async (saveStatus: "draft" | "published") => {
    if (!title.trim()) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        slug: slug || toSlug(title),
        content: editor?.getHTML() ?? "",
        excerpt: excerpt.trim(),
        coverImage: coverImage.trim(),
        tags,
        status: saveStatus,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        focusKeyword: focusKeyword.trim(),
      };

      const url = isEdit ? `/api/admin/posts/${post._id}` : "/api/admin/posts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      setStatus(saveStatus);
      setIsDirty(false);
      showToast(saveStatus === "published" ? "Published!" : "Draft saved", "success");

      if (!isEdit && data.post?._id) {
        setTimeout(() => router.replace(`/secure-7x9/posts/${data.post._id}/edit`), 800);
      }
    } catch {
      showToast("Failed to save. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }, [title, slug, excerpt, coverImage, tags, editor, isEdit, post, router, showToast]);

  const handleCoverUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { showToast("Please select an image file", "error"); return; }
    setUploadingCover(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, folder: "blog/covers" }),
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        setCoverImage(url);
        setIsDirty(true);
        showToast("Image uploaded!", "success");
        setUploadingCover(false);
      };
      reader.onerror = () => { showToast("Failed to read file", "error"); setUploadingCover(false); };
      reader.readAsDataURL(file);
    } catch {
      showToast("Upload failed. Try again.", "error");
      setUploadingCover(false);
    }
  }, [showToast]);

  const handleBodyImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { showToast("Please select an image file", "error"); return; }
    setUploadingBodyImg(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, folder: "blog/content" }),
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        editor?.chain().focus().setImage({ src: url }).run();
        setIsDirty(true);
        setImgDialog(false);
        showToast("Image uploaded!", "success");
        setUploadingBodyImg(false);
      };
      reader.onerror = () => { showToast("Failed to read file", "error"); setUploadingBodyImg(false); };
      reader.readAsDataURL(file);
    } catch {
      showToast("Upload failed. Try again.", "error");
      setUploadingBodyImg(false);
    }
  }, [editor, showToast]);

  const addTag = useCallback(() => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags((p) => [...p, t]); setIsDirty(true); }
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = (t: string) => { setTags((p) => p.filter((x) => x !== t)); setIsDirty(true); };

  const applyLink = () => {
    if (!linkUrl) { editor?.chain().focus().unsetLink().run(); }
    else { editor?.chain().focus().setLink({ href: linkUrl }).run(); }
    setLinkDialog(false);
    setLinkUrl("");
  };

  const insertImage = () => {
    if (imgUrl) editor?.chain().focus().setImage({ src: imgUrl }).run();
    setImgDialog(false);
    setImgUrl("");
  };

  const handleBack = () => {
    if (isDirty) { setShowLeaveConfirm(true); }
    else { router.push("/secure-7x9/posts"); }
  };

  if (!editor) return null;

  return (
    <div className="pe-wrap">
      {/* Top bar */}
      <div className="pe-topbar">
        <div className="pe-topbar-left">
          <button className="pe-back-btn" onClick={handleBack}>
            <ArrowLeft size={14} /> Posts
          </button>
          <p className="pe-topbar-title">{title || "Untitled post"}</p>
          <span className={`pe-status-badge ${status === "published" ? "pe-status-published" : "pe-status-draft"}`}>
            {status === "published" ? <Eye size={10} /> : <FileText size={10} />}
            {status}
          </span>
          {isDirty && <span className="pe-unsaved-badge">Unsaved changes</span>}
        </div>
        <div className="pe-topbar-right">
          <button className="pe-btn-draft" onClick={() => handleSave("draft")} disabled={saving}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Draft
          </button>
          <button className="pe-btn-publish" onClick={() => handleSave("published")} disabled={saving}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="pe-main">
        {/* Editor column */}
        <div className="pe-editor-col">
          {/* Title */}
          <textarea
            className="pe-title-input"
            placeholder="Post title..."
            value={title}
            onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
            rows={2}
          />
          <div className="pe-title-divider" />

          {/* Toolbar */}
          <div className="pe-toolbar">
            {/* History */}
            <div className="pe-toolbar-group">
              <button className="pe-tb-btn" title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                <Undo size={14} />
              </button>
              <button className="pe-tb-btn" title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                <Redo size={14} />
              </button>
            </div>

            <div className="pe-toolbar-divider" />

            {/* Formatting */}
            <div className="pe-toolbar-group">
              <button className={`pe-tb-btn${editor.isActive("bold") ? " is-active" : ""}`} title="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
                <Bold size={14} />
              </button>
              <button className={`pe-tb-btn${editor.isActive("italic") ? " is-active" : ""}`} title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Italic size={14} />
              </button>
              <button className={`pe-tb-btn${editor.isActive("underline") ? " is-active" : ""}`} title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <UnderlineIcon size={14} />
              </button>
              <button className={`pe-tb-btn${editor.isActive("strike") ? " is-active" : ""}`} title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}>
                <Strikethrough size={14} />
              </button>
            </div>

            <div className="pe-toolbar-divider" />

            {/* Headings */}
            <div className="pe-toolbar-group">
              <button className={`pe-tb-btn${editor.isActive("heading", { level: 1 }) ? " is-active" : ""}`} title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 size={14} />
              </button>
              <button className={`pe-tb-btn${editor.isActive("heading", { level: 2 }) ? " is-active" : ""}`} title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 size={14} />
              </button>
              <button className={`pe-tb-btn${editor.isActive("heading", { level: 3 }) ? " is-active" : ""}`} title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 size={14} />
              </button>
            </div>

            <div className="pe-toolbar-divider" />

            {/* Lists */}
            <div className="pe-toolbar-group">
              <button className={`pe-tb-btn${editor.isActive("bulletList") ? " is-active" : ""}`} title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List size={14} />
              </button>
              <button className={`pe-tb-btn${editor.isActive("orderedList") ? " is-active" : ""}`} title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered size={14} />
              </button>
            </div>

            <div className="pe-toolbar-divider" />

            {/* Blocks */}
            <div className="pe-toolbar-group">
              <button className={`pe-tb-btn${editor.isActive("blockquote") ? " is-active" : ""}`} title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote size={14} />
              </button>
              <button className={`pe-tb-btn${editor.isActive("code") ? " is-active" : ""}`} title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()}>
                <Code size={14} />
              </button>
              <button className={`pe-tb-btn${editor.isActive("codeBlock") ? " is-active" : ""}`} title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                <FileCode size={14} />
              </button>
            </div>

            <div className="pe-toolbar-divider" />

            {/* Media & extras */}
            <div className="pe-toolbar-group">
              <button
                className={`pe-tb-btn${editor.isActive("link") ? " is-active" : ""}`}
                title="Insert Link"
                onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkDialog(true); }}
              >
                <LinkIcon size={14} />
              </button>
              <button className="pe-tb-btn" title="Insert Image" onClick={() => setImgDialog(true)}>
                <ImageIcon size={14} />
              </button>
              <button className="pe-tb-btn" title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <Minus size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="pe-editor-content">
            <EditorContent editor={editor} />
          </div>

          <div className="pe-word-count">{wordCount} words</div>
        </div>

        {/* Sidebar */}
        <div className="pe-sidebar">
          {/* Publish */}
          <div className="pe-sidebar-card">
            <div className="pe-sidebar-card-header">
              <h3><Send size={13} /> Publish</h3>
            </div>
            <div className="pe-sidebar-card-body">
              <div className="pe-field">
                <label>Status</label>
                <div className="pe-status-select">
                  <button className={`pe-status-opt${status === "draft" ? " active-draft" : ""}`} onClick={() => { setStatus("draft"); setIsDirty(true); }}>
                    Draft
                  </button>
                  <button className={`pe-status-opt${status === "published" ? " active-published" : ""}`} onClick={() => { setStatus("published"); setIsDirty(true); }}>
                    Published
                  </button>
                </div>
              </div>
              <button className="pe-publish-btn-full" onClick={() => handleSave(status)} disabled={saving}>
                {saving
                  ? <><Loader2 size={13} style={{ display: "inline", marginRight: 6 }} className="animate-spin" />Saving...</>
                  : status === "published" ? "Update Post" : "Save Draft"
                }
              </button>
            </div>
          </div>

          {/* SEO / URL */}
          <div className="pe-sidebar-card">
            <div className="pe-sidebar-card-header">
              <h3><FileText size={13} /> SEO & URL</h3>
            </div>
            <div className="pe-sidebar-card-body">
              <div className="pe-field">
                <label>URL Slug</label>
                <input
                  value={slug}
                  onChange={(e) => { slugEditedRef.current = true; setSlug(e.target.value); setIsDirty(true); }}
                  placeholder="post-url-slug"
                />
              </div>
              <div className="pe-field">
                <label>Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => { setExcerpt(e.target.value); setIsDirty(true); }}
                  placeholder="Short summary shown on blog cards..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="pe-sidebar-card">
            <div className="pe-sidebar-card-header">
              <h3><ImageIcon size={13} /> Cover Image</h3>
            </div>
            <div className="pe-sidebar-card-body">
              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ""; }}
              />
              <button
                className="pe-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover
                  ? <><Loader2 size={13} className="animate-spin" /> Uploading...</>
                  : <><Upload size={13} /> Upload Image</>
                }
              </button>

              <div className="pe-upload-divider">or paste URL</div>

              <div className="pe-field">
                <input
                  value={coverImage}
                  onChange={(e) => { setCoverImage(e.target.value); setIsDirty(true); }}
                  placeholder="https://..."
                />
              </div>
              {coverImage && (
                <div className="pe-cover-preview-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="Cover preview" className="pe-cover-preview" />
                  <button
                    className="pe-cover-remove"
                    onClick={() => { setCoverImage(""); setIsDirty(true); }}
                    title="Remove cover image"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="pe-sidebar-card">
            <div className="pe-sidebar-card-header">
              <h3><Eye size={13} /> SEO</h3>
            </div>
            <div className="pe-sidebar-card-body">
              {/* SERP Preview */}
              <div className="pe-serp-preview">
                <p className="pe-serp-label">Google Preview</p>
                <div className="pe-serp-box">
                  <p className="pe-serp-url">myhomestyler.com › blog › {slug || "post-slug"}</p>
                  <p className="pe-serp-title">{metaTitle || title || "Post Title"}</p>
                  <p className="pe-serp-desc">{metaDescription || excerpt || "Your meta description will appear here in Google search results."}</p>
                </div>
              </div>

              <div className="pe-field" style={{ marginTop: "0.75rem" }}>
                <label>
                  Focus Keyword
                </label>
                <input
                  value={focusKeyword}
                  onChange={(e) => { setFocusKeyword(e.target.value); setIsDirty(true); }}
                  placeholder="e.g. floor plan generator"
                />
              </div>

              <div className="pe-field">
                <label>
                  Meta Title
                  <span className={`pe-char-count ${metaTitle.length > 60 ? "pe-char-over" : metaTitle.length > 50 ? "pe-char-good" : ""}`}>
                    {metaTitle.length}/60
                  </span>
                </label>
                <input
                  value={metaTitle}
                  onChange={(e) => { setMetaTitle(e.target.value); setIsDirty(true); }}
                  placeholder={title ? title + " — MyHomeStyler Blog" : "SEO title..."}
                  maxLength={80}
                />
                {!metaTitle && <p className="pe-seo-hint">Defaults to post title if left empty</p>}
              </div>

              <div className="pe-field">
                <label>
                  Meta Description
                  <span className={`pe-char-count ${metaDescription.length > 160 ? "pe-char-over" : metaDescription.length > 120 ? "pe-char-good" : ""}`}>
                    {metaDescription.length}/160
                  </span>
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => { setMetaDescription(e.target.value); setIsDirty(true); }}
                  placeholder={excerpt || "Short description for search engines..."}
                  rows={3}
                  maxLength={200}
                />
                {!metaDescription && <p className="pe-seo-hint">Defaults to excerpt if left empty</p>}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="pe-sidebar-card">
            <div className="pe-sidebar-card-header">
              <h3><Tag size={13} /> Tags</h3>
            </div>
            <div className="pe-sidebar-card-body">
              <div className="pe-tag-input-row">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag..."
                />
                <button className="pe-tag-add-btn" onClick={addTag}>Add</button>
              </div>
              {tags.length > 0 && (
                <div className="pe-tags-list">
                  {tags.map((t) => (
                    <span key={t} className="pe-tag">
                      {t}
                      <button className="pe-tag-remove" onClick={() => removeTag(t)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Link dialog */}
      {linkDialog && (
        <div className="pe-link-dialog" onClick={() => setLinkDialog(false)}>
          <div className="pe-link-dialog-box" onClick={(e) => e.stopPropagation()}>
            <h4>Insert Link</h4>
            <div className="pe-field">
              <label>URL</label>
              <input
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applyLink(); }}
                placeholder="https://example.com"
              />
            </div>
            <div className="pe-link-dialog-actions">
              <button className="pe-link-cancel" onClick={() => setLinkDialog(false)}>Cancel</button>
              {editor.isActive("link") && (
                <button className="pe-link-cancel" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkDialog(false); }}>
                  Remove
                </button>
              )}
              <button className="pe-link-confirm" onClick={applyLink}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Image dialog */}
      {imgDialog && (
        <div className="pe-img-dialog" onClick={() => setImgDialog(false)}>
          <div className="pe-img-dialog-box" onClick={(e) => e.stopPropagation()}>
            <h4>Insert Image</h4>

            {/* Upload from device */}
            <input
              ref={imgFileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBodyImageUpload(f); e.target.value = ""; }}
            />
            <button
              className="pe-upload-btn"
              style={{ marginBottom: "0.75rem" }}
              onClick={() => imgFileInputRef.current?.click()}
              disabled={uploadingBodyImg}
            >
              {uploadingBodyImg
                ? <><Loader2 size={13} className="animate-spin" /> Uploading...</>
                : <><Upload size={13} /> Upload from device</>
              }
            </button>

            <div className="pe-upload-divider">or paste URL</div>

            <div className="pe-field">
              <input
                autoFocus
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") insertImage(); }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="pe-link-dialog-actions">
              <button className="pe-link-cancel" onClick={() => setImgDialog(false)}>Cancel</button>
              <button className="pe-link-confirm" onClick={insertImage}>Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave confirmation */}
      {showLeaveConfirm && (
        <div className="pe-link-dialog" onClick={() => setShowLeaveConfirm(false)}>
          <div className="pe-link-dialog-box" onClick={(e) => e.stopPropagation()}>
            <h4>Unsaved changes</h4>
            <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
              You have unsaved changes. Leave without saving?
            </p>
            <div className="pe-link-dialog-actions">
              <button className="pe-link-cancel" onClick={() => setShowLeaveConfirm(false)}>Stay</button>
              <button
                className="pe-link-confirm"
                style={{ background: "#dc2626" }}
                onClick={() => { setIsDirty(false); router.push("/secure-7x9/posts"); }}
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
