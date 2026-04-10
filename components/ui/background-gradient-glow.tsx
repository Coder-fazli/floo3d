"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackgroundGradientGlowProps {
  className?: string;
  children?: React.ReactNode;
}

export const BackgroundGradientGlow = ({ className, children, noBackground }: BackgroundGradientGlowProps & { noBackground?: boolean }) => {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}
      style={noBackground ? undefined : { background: "linear-gradient(to bottom, #00CEC8 0%, #5ADBD6 50%, #C2F4F2 100%)" }}
    >
      {/* Dot pattern with radial fade */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          WebkitMaskImage: "radial-gradient(60vw circle at 40% 50%, white, transparent)",
          maskImage: "radial-gradient(60vw circle at 40% 50%, white, transparent)",
        }}
      />

      {/* Top-left teal glow blob */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.35, scale: 1 }}
        transition={{ duration: 1.4 }}
        className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full z-0"
        style={{ background: "rgba(0,206,200,0.5)", filter: "blur(110px)" }}
      />

      {/* Bottom-right cream/peach glow blob */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.3 }}
        className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full z-0"
        style={{ background: "rgba(255,156,95,0.35)", filter: "blur(140px)" }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 0.25, y: [0, -18, 0] }}
            transition={{
              duration: 5 + (i * 0.3) % 5,
              repeat: Infinity,
              delay: (i * 0.2) % 5,
            }}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.6)",
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Fade to white at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: "120px", background: "linear-gradient(to bottom, transparent, #ffffff)" }}
      />
    </div>
  );
};
