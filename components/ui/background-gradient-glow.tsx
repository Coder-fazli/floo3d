"use client";

import { cn } from "@/lib/utils";

interface BackgroundGradientGlowProps {
  className?: string;
  children?: React.ReactNode;
}

export const BackgroundGradientGlow = ({ className, children, noBackground }: BackgroundGradientGlowProps & { noBackground?: boolean }) => {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}
      style={noBackground ? undefined : { background: "linear-gradient(to bottom, #faf7f4 60%, transparent 100%)" }}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>

    </div>
  );
};
