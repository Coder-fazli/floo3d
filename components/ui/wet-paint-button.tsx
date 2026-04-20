"use client";
import React from "react";
import { cn } from "@/lib/utils";

const WetPaintButton = ({ children, className }: { className?: string; children: React.ReactNode }) => {
  return (
    <button
      className={cn("wet-paint-btn px-9 py-[1.1rem] text-[0.72rem] font-bold text-white uppercase tracking-[0.2em] cursor-pointer transition-opacity relative overflow-hidden hover:opacity-90", className)}
      style={{ background: "var(--brand-color)", boxShadow: "none", borderRadius: "0.25rem" }}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default WetPaintButton;
