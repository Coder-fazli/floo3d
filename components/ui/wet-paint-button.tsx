"use client";
import React from "react";
import { cn } from "@/lib/utils";

const WetPaintButton = ({ children, className }: { className?: string; children: React.ReactNode }) => {
  return (
    <button
      className={cn("wet-paint-btn rounded-full px-5 py-2 text-sm md:px-8 md:py-4 md:text-xl font-black text-white tracking-wide cursor-pointer transition-all relative overflow-hidden", className)}
      style={{ background: "linear-gradient(145deg, #FF8A70, #EB4203)", boxShadow: "0 0 16px 4px rgba(235, 66, 3, 0.18), 0 6px 16px rgba(235, 66, 3, 0.15)" }}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default WetPaintButton;
