"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type TextButtonProps = {
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/**
 * Quiet text control — back / cancel / dismiss / tertiary links.
 * Never use for primary CTAs.
 */
export function TextButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...rest
}: TextButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={["ds-text-btn", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
