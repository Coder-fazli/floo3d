"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const WetPaintButton = ({ children, className }: { className?: string; children: React.ReactNode }) => {
  return (
    <button className={cn("group relative rounded-xl bg-[#EB4203] px-8 py-4 text-xl font-black text-white tracking-wide transition-colors hover:bg-[#D13A02] drop-shadow-lg", className)}>
      {children}
      <Drip left="10%" height={24} delay={0.5} />
      <Drip left="30%" height={20} delay={3} />
      <Drip left="57%" height={10} delay={4.25} />
      <Drip left="85%" height={16} delay={1.5} />
    </button>
  );
};

type DripProps = { left: string; height: number; delay: number };

const Drip: React.FC<DripProps> = ({ left, height, delay }) => {
  return (
    <motion.div
      className="absolute top-[99%] origin-top"
      style={{ left }}
      initial={{ scaleY: 0.75 }}
      animate={{ scaleY: [0.75, 1, 0.75] }}
      transition={{ duration: 2, times: [0, 0.25, 1], delay, ease: "easeIn", repeat: Infinity, repeatDelay: 2 }}
    >
      <div style={{ height }} className="w-2 rounded-b-full bg-[#EB4203] transition-colors group-hover:bg-[#D13A02]" />

      {/* Right curve */}
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="absolute left-full top-0">
        <g clipPath="url(#wpclip-r)">
          <path fillRule="evenodd" clipRule="evenodd" d="M5.4 0H0V5.4C0 2.41765 2.41766 0 5.4 0Z" className="fill-[#EB4203] transition-colors group-hover:fill-[#D13A02]" />
        </g>
        <defs><clipPath id="wpclip-r"><rect width="6" height="6" fill="white" /></clipPath></defs>
      </svg>

      {/* Left curve */}
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="absolute right-full top-0 rotate-90">
        <g clipPath="url(#wpclip-l)">
          <path fillRule="evenodd" clipRule="evenodd" d="M5.4 0H0V5.4C0 2.41765 2.41766 0 5.4 0Z" className="fill-[#EB4203] transition-colors group-hover:fill-[#D13A02]" />
        </g>
        <defs><clipPath id="wpclip-l"><rect width="6" height="6" fill="white" /></clipPath></defs>
      </svg>

      {/* Falling droplet */}
      <motion.div
        initial={{ y: -8, opacity: 1 }}
        animate={{ y: [-8, 50], opacity: [1, 0] }}
        transition={{ duration: 2, times: [0, 1], delay, ease: "easeIn", repeat: Infinity, repeatDelay: 2 }}
        className="absolute top-full h-2 w-2 rounded-full bg-[#EB4203] transition-colors group-hover:bg-[#D13A02]"
      />
    </motion.div>
  );
};

export default WetPaintButton;
