"use client";
import { useState } from "react";
import "./render-buttons.css";

interface ShareButtonProps {
  projectId: string;
  imageUrl?: string | null;
  fileName?: string;
  active?: boolean;
}

export default function ShareButton({ projectId, imageUrl, fileName = "render", active }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/visualizer/${projectId}`
    : "";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setOpen(false);
    alert("Link copied!");
  };

  const handleShareImage = async () => {
    setOpen(false);
    if (!imageUrl) { await navigator.clipboard.writeText(shareUrl); return; }
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const file = new File([blob], `${fileName}.${ext}`, { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName });
        return;
      }
      await navigator.share({ title: fileName, url: shareUrl });
    } catch (e) {
      if ((e as Error).name !== "AbortError") window.open(imageUrl, "_blank");
    }
  };

  const handleShareTwitter = () => {
    setOpen(false);
    const text = encodeURIComponent(`Check out my AI-generated render: ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className={`pj-img-footer-btn${open || active ? " pj-img-footer-btn-active" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg width="28" height="28" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round">
          <path d="M368 32l112 112-112 112V192c-96 0-192 32-224 128 0-128 64-240 224-256V32z"/>
          <path d="M432 368v80a32 32 0 0 1-32 32H80a32 32 0 0 1-32-32V144a32 32 0 0 1 32-32h80"/>
        </svg>
        <span>Share</span>
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 149 }} onClick={() => setOpen(false)} />
          <div className="rb-share-popover">
            <button className="rb-share-option" onClick={handleCopyLink}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Copy link
            </button>
            <button className="rb-share-option" onClick={handleShareImage}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              Share Image
            </button>
            <button className="rb-share-option" onClick={handleShareTwitter}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </button>
          </div>
        </>
      )}
    </div>
  );
}
