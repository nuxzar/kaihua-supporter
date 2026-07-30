"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PaperWindow } from "@/components/ds/PaperWindow";
import { TextButton } from "@/components/ds/TextButton";

type SheetDrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  showCloseLabel?: boolean;
};

export function SheetDrawer({
  open,
  title,
  onClose,
  children,
  showCloseLabel = true,
}: SheetDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="关闭"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 z-50 bg-black/25"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.4, 0.1, 0.2, 1] }}
            className="absolute inset-x-3 bottom-3 z-50 mx-auto max-h-[55dvh] w-auto max-w-xl sm:inset-x-6"
          >
            <PaperWindow
              title={title}
              tone="blue"
              flat
              bodyClassName="max-h-[42dvh] overflow-y-auto overscroll-contain pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            >
              {showCloseLabel ? (
                <TextButton onClick={onClose} className="mb-3 !text-sm">
                  收起
                </TextButton>
              ) : null}
              {children}
            </PaperWindow>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
