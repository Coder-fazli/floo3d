"use client";
import "./render-buttons.css";

interface CompareButtonProps {
  active?: boolean;
  onClick: () => void;
}

export default function CompareButton({ active, onClick }: CompareButtonProps) {
  return (
    <button
      className={`pj-img-footer-btn${active ? " pj-img-footer-btn-active" : ""}`}
      onClick={onClick}
    >
      <svg width="28" height="28" viewBox="0 0 512 512" fill="currentColor">
        <path d="M75 92v328h362V92H75zm322 288H115V132h282v248zM181 204a25 25 0 1 0 0-50 25 25 0 0 0 0 50zm-46 136 70-96 46 64 34-46 72 78H135zM0 142h55v228H0zm457 0h55v228h-55zM96 420h320v50H96zm46 62h18v30h-18zm36 0h18v30h-18zm36 0h18v30h-18zm36 0h18v30h-18zm36 0h18v30h-18zM66 450H18l24-30 24 30zm380 0 24-30 24 30h-48z"/>
      </svg>
      <span>Compare</span>
    </button>
  );
}
