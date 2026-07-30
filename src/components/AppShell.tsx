"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { KaihuaApp } from "@/components/KaihuaApp";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

const paperTransition = {
  duration: 0.65,
  ease: [0.22, 1.15, 0.36, 1] as const,
};

/**
 * Outermost client shell — GlobalLoader covers the viewport until fonts +
 * core assets are ready; business scenes (KaihuaApp) do not mount before that.
 * Exit: loader slides left; home enters from the right (SceneContainer language).
 */
export function AppShell() {
  const [showLoader, setShowLoader] = useState(true);
  const [showApp, setShowApp] = useState(false);

  const handleExitStart = useCallback(() => {
    setShowApp(true);
  }, []);

  const handleFinished = useCallback(() => {
    setShowLoader(false);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {showLoader ? (
        <div
          className={`absolute inset-0 z-50${showApp ? " pointer-events-none" : ""}`}
          aria-hidden={showApp || undefined}
        >
          <GlobalLoader onExitStart={handleExitStart} onFinished={handleFinished} />
        </div>
      ) : null}

      {showApp ? (
        <motion.div
          key="kaihua-app"
          className="absolute inset-0 z-10 h-full w-full"
          initial={{ x: "100%", scale: 0.98, opacity: 1 }}
          animate={{ x: "0%", scale: 1, opacity: 1 }}
          transition={paperTransition}
        >
          <KaihuaApp />
        </motion.div>
      ) : null}
    </div>
  );
}
