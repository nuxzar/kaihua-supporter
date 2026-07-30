"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import { TEE_WIDTH_FACTOR } from "@/lib/photo-stage";
import type { TeeTransform } from "@/types";

type TeeEditorProps = {
  photoUrl: string;
  transform: TeeTransform;
  onChange: (next: TeeTransform) => void;
  className?: string;
  locked?: boolean;
  /** Photo sticks onto the desk on enter */
  photoEnter?: boolean;
  showTee?: boolean;
};

type DragMode = "move" | null;

/**
 * Workshop stage — photo + Tee drag (no spring jump).
 */
export function TeeEditor({
  photoUrl,
  transform,
  onChange,
  className = "",
  locked = false,
  photoEnter = false,
  showTee = true,
}: TeeEditorProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragMode = useRef<DragMode>(null);
  const transformRef = useRef(transform);
  const [active, setActive] = useState(false);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage || dragMode.current !== "move") return;
      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      const t = transformRef.current;
      onChange({
        ...t,
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
        opacity: 1,
      });
    },
    [onChange],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (locked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragMode.current = "move";
    setActive(true);
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (locked) return;
    if (dragMode.current !== "move") return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const endDrag = () => {
    dragMode.current = null;
    setActive(false);
  };

  useEffect(() => {
    const onUp = () => endDrag();
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={`absolute inset-0 overflow-hidden bg-[var(--ds-paper-deep)] select-none touch-none ${className}`}
    >
      <motion.div
        className="absolute inset-0"
        initial={
          photoEnter
            ? { opacity: 0, scale: 1.18, rotate: -4, y: -28 }
            : false
        }
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt="上传的全身照"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {/* Sticker tape corners after slap */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-2 top-2 h-3 w-10 rotate-[-12deg] bg-[color-mix(in_srgb,var(--ds-progress)_88%,white)] opacity-80 mix-blend-multiply shadow-[var(--ds-shadow-press)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 right-3 h-3 w-9 rotate-[9deg] bg-[color-mix(in_srgb,var(--ds-win-blue)_55%,white)] opacity-80 mix-blend-multiply shadow-[var(--ds-shadow-press)]"
        />
      </motion.div>

      {showTee ? (
        <div
          role="img"
          aria-label="块杰明呼兰克林 Tee，可拖动调整位置"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          className={`absolute ${locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"} ${active ? "z-20" : "z-10"}`}
          style={{
            left: `${transform.x}%`,
            top: `${transform.y}%`,
            width: `${transform.scale * TEE_WIDTH_FACTOR * 100}%`,
            transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
            touchAction: "none",
          }}
        >
          <div className="tee-sticker relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.tee}
              alt=""
              className="tee-fabric pointer-events-none relative h-auto w-full"
              draggable={false}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute -inset-1 border-2 border-dashed border-[var(--ds-ink)] ${
                active ? "opacity-100" : "opacity-55"
              }`}
            />
            {(
              [
                "-left-1 -top-1",
                "-right-1 -top-1",
                "-left-1 -bottom-1",
                "-right-1 -bottom-1",
              ] as const
            ).map((pos) => (
              <span
                key={pos}
                aria-hidden
                className={`pointer-events-none absolute ${pos} h-2.5 w-2.5 border-2 border-[var(--ds-ink)] bg-[var(--ds-progress)] ${
                  active ? "opacity-100" : "opacity-55"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
