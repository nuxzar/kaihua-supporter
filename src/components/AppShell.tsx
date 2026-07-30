"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { KaihuaApp } from "@/components/KaihuaApp";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import {
  paperSlide,
  paperTransition,
  useMobileMotionProfile,
} from "@/lib/paper-motion";

/**
 * Outermost client shell — GlobalLoader covers the viewport until fonts +
 * core assets are ready; business scenes (KaihuaApp) do not mount before that.
 * Exit: loader slides left; home enters from the right (SceneContainer language).
 */
export function AppShell() {
  const [showLoader, setShowLoader] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const mobileMotion = useMobileMotionProfile();

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
          className="paper-slide-layer absolute inset-0 z-10 h-full w-full"
          initial={paperSlide(mobileMotion, "100%")}
          animate={paperSlide(mobileMotion, "0%")}
          transition={paperTransition(mobileMotion)}
        >
          <KaihuaApp />
        </motion.div>
      ) : null}
    </div>
  );
}
