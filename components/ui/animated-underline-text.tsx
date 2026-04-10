"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedUnderlineTextProps {
  text: string;
  className?: string;
  underlineClassName?: string;
  underlineDuration?: number;
}

const AnimatedUnderlineText = ({
  text,
  className,
  underlineClassName,
  underlineDuration = 1.5,
}: AnimatedUnderlineTextProps) => {
  const pathVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: underlineDuration, ease: "easeInOut" },
    },
  };

  return (
    <span className={cn("relative inline-block", className)}>
      {text}
      <span className="absolute left-0 right-0" style={{ bottom: "-8px", height: "12px" }}>
        <motion.svg
          width="100%"
          height="12"
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          className={cn("", underlineClassName)}
        >
          <motion.path
            d="M 0,6 Q 25,0 50,6 Q 75,12 100,6"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
        </motion.svg>
      </span>
    </span>
  );
};

export { AnimatedUnderlineText };
