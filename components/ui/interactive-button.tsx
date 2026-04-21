'use client';

import React from "react";
import { motion, Transition } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  href?: string;
}

export const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = "Button", className, href, onClick, ...props }, ref) => {
    // Tropical Heat palette — no blue
    const glowColors = ["#fb3b01", "#FF9C5F", "#FCEFC3", "#00CEC8"];
    const scale = 1.6;
    const duration = 6;

    const breatheEffect = {
      background: glowColors.map(
        (color) => `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        repeat: Infinity,
        duration,
        repeatType: "mirror",
        ease: "easeInOut",
      } as Transition,
    };

    const inner = (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3 font-semibold transition-all duration-300",
          "border border-white/30 bg-white/15 backdrop-blur-md text-white",
          "hover:shadow-xl text-base",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <motion.div
          animate={breatheEffect}
          className="pointer-events-none absolute inset-0 z-0 transform-gpu blur-lg scale-[1.6]"
          style={{ willChange: "transform", backfaceVisibility: "hidden" }}
        />
        <span className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:translate-x-1">
          {text}
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    );

    if (href) {
      return <a href={href}>{inner}</a>;
    }
    return inner;
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";
