"use client";
import { Maximize2 } from "lucide-react";
import "./render-buttons.css";

interface ExpandButtonProps {
  active?: boolean;
  onClick: () => void;
}

export default function ExpandButton({ active, onClick }: ExpandButtonProps) {
  return (
    <button
      className={`pj-img-footer-btn${active ? " pj-img-footer-btn-active" : ""}`}
      onClick={onClick}
    >
      <Maximize2 size={28} />
      <span>Expand</span>
    </button>
  );
}
