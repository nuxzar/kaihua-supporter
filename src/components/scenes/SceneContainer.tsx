"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NavDirection } from "@/types";

type SceneContainerProps = {
  sceneKey: string;
  direction: NavDirection;
  children: ReactNode;
};

/** Two papers cross on the desk — no fade, slight scale only */
const paperTransition = {
  duration: 0.65,
  ease: [0.22, 1.15, 0.36, 1] as const,
};

function dirSign(direction: NavDirection) {
  return direction === "next" ? 1 : -1;
}

/**
 * Overlapping paper push (exit + enter coexist):
 * next — enter from right (100%), exit to left (-100%)
 * prev — mirrored
 *
 * First painted scene must start centered. Starting at x:100% on the
 * initial mount can get stuck off-screen after hydration / chrome updates.
 */
const paperVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? "100%" : "-100%",
    scale: 0.98,
    opacity: 1,
  }),
  center: {
    x: "0%",
    scale: 1,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? "-100%" : "100%",
    scale: 0.98,
    opacity: 1,
  }),
};

export function SceneContainer({
  sceneKey,
  direction,
  children,
}: SceneContainerProps) {
  const custom = dirSign(direction);

  // AnimatePresence `initial={false}` skips enter on first paint; later
  // scene keys still run the enter variant without reading a prev-key ref.
  return (
    <div className="scene-container absolute inset-0 h-full min-h-0 w-full overflow-hidden">
      <AnimatePresence custom={custom} initial={false}>
        <motion.div
          key={sceneKey}
          custom={custom}
          variants={paperVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={paperTransition}
          className="absolute inset-0 h-full w-full overflow-hidden will-change-transform"
          style={{ transformOrigin: "center center" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
