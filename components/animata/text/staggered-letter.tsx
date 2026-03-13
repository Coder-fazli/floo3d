import { HTMLAttributes } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface DropLetterProps extends HTMLAttributes<HTMLDivElement> {
  applyMask?: boolean;
  text?: string;
  delay?: number;
  direction?: "up" | "drop";
  letterClassName?: string;
}

export default function StaggeredLetter({
  applyMask = true,
  text = "Animata",
  delay = 0.09,
  direction = "drop",
  className,
  letterClassName,
  ...props
}: DropLetterProps) {
  const common = letterClassName ?? "text-7xl font-bold drop-shadow-lg";
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center text-foreground",
        className,
      )}
      {...props}
    >
      {applyMask && <div className={cn(common, "absolute text-gray-400")}>{text}</div>}
      <div className="flex">
        {text.split("").map((letter, index) => (
          <motion.div
            className={common}
            initial={{ opacity: 0, y: direction === "up" ? 150 : -150 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * delay,
            }}
            key={index}
          >
            {letter === " " ? <span>&nbsp;</span> : letter}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
