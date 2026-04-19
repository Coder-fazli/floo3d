"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  separator?: string;
  className?: string;
  suffix?: string;
  colorScheme?: "gradient" | "default";
}

export function CountUp({
  value,
  duration = 2,
  separator = ",",
  className = "",
  suffix = "",
  colorScheme = "default",
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setCount(value);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  const formatted = count.toLocaleString("en-US").replace(/,/g, separator);

  if (colorScheme === "gradient") {
    return (
      <span
        className={className}
        style={{
          background: "linear-gradient(90deg, var(--brand-color), #f97316)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800,
        }}
      >
        {formatted}{suffix}
      </span>
    );
  }

  return <span className={className}>{formatted}{suffix}</span>;
}
