"use client";

import { useEffect, useRef, useState } from "react";
import "./NameProjectModal.css";

interface Props {
  open: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function NameProjectModal({ open, onConfirm, onCancel }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleConfirm = () => {
    const name = value.trim() || "Untitled";
    onConfirm(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  };

  if (!open) return null;

  return (
    <div className="npm-backdrop" onClick={onCancel}>
      <div className="npm-card" onClick={(e) => e.stopPropagation()}>
        <div className="npm-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>
        <h3 className="npm-title">Name your project</h3>
        <p className="npm-sub">Give it a name so you can find it later</p>
        <input
          ref={inputRef}
          className="npm-input"
          type="text"
          placeholder="e.g. Living Room Redesign"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={60}
        />
        <div className="npm-actions">
          <button className="npm-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="npm-btn-confirm" onClick={handleConfirm}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
