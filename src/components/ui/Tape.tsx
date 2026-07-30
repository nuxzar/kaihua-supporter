"use client";

import { motion } from "framer-motion";

type TapeProps = {
  color?: "yellow" | "blue" | "pink";
  className?: string;
  rotate?: number;
  width?: string;
};

const colors = {
  yellow: "bg-tape",
  blue: "bg-tape-blue",
  pink: "bg-tape-pink",
};

export function Tape({
  color = "yellow",
  className = "",
  rotate = -8,
  width = "4.5rem",
}: TapeProps) {
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, y: -6, scaleX: 0.7 }}
      animate={{ opacity: 0.88, y: 0, scaleX: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
      style={{ transform: `rotate(${rotate}deg)`, width }}
      className={`tape-strip pointer-events-none absolute z-20 h-5 mix-blend-multiply ${colors[color]} ${className}`}
    />
  );
}
