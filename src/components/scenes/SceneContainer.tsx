"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  paperTransition,
  useMobileMotionProfile,
} from "@/lib/paper-motion";
import type { NavDirection } from "@/types";

type SceneContainerProps = {
  sceneKey: string;
  direction: NavDirection;
  children: ReactNode;
};

function dirSign(direction: NavDirection) {
  return direction === "next" ? 1 : -1;
}

function resetHorizontalScroll(root: HTMLElement | null) {
  if (!root) return;
  root.scrollLeft = 0;
  root.querySelectorAll(".scene-content--scroll").forEach((node) => {
    if (node instanceof HTMLElement) node.scrollLeft = 0;
  });
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
}

export function SceneContainer({
  sceneKey,
  direction,
  children,
}: SceneContainerProps) {
  const custom = dirSign(direction);
  const mobileMotion = useMobileMotionProfile();
  const containerRef = useRef<HTMLDivElement>(null);

  const paperVariants = useMemo(
    () =>
      mobileMotion
        ? {
            enter: (dir: number) => ({
              x: dir >= 0 ? "100%" : "-100%",
              opacity: 1,
            }),
            center: { x: "0%", opacity: 1 },
            exit: (dir: number) => ({
              x: dir >= 0 ? "-100%" : "100%",
              opacity: 1,
            }),
          }
        : {
            enter: (dir: number) => ({
              x: dir >= 0 ? "100%" : "-100%",
              scale: 0.98,
              opacity: 1,
            }),
            center: {
              x: "0%",
              scale: 1,
              opacity: 1,
            },
            exit: (dir: number) => ({
              x: dir >= 0 ? "-100%" : "100%",
              scale: 0.98,
              opacity: 1,
            }),
          },
    [mobileMotion],
  );

  useLayoutEffect(() => {
    resetHorizontalScroll(containerRef.current);
  }, [sceneKey]);

  return (
    <div
      ref={containerRef}
      className="scene-container absolute inset-0 h-full min-h-0 w-full overflow-hidden"
    >
      <AnimatePresence custom={custom} initial={false}>
        <motion.div
          key={sceneKey}
          custom={custom}
          variants={paperVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={paperTransition(mobileMotion)}
          className="absolute inset-0 h-full w-full overflow-hidden overflow-x-clip will-change-transform"
          style={{ transformOrigin: "center center" }}
          onAnimationComplete={(definition) => {
            if (definition === "center") {
              resetHorizontalScroll(containerRef.current);
            }
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
