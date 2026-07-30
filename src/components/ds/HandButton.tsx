"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type HandButtonProps = {
  children: ReactNode;
  /** primary = main CTA; secondary / ghost = supporting actions in drawers */
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const variantClass: Record<NonNullable<HandButtonProps["variant"]>, string> = {
  primary: "ds-btn--primary",
  secondary: "ds-btn--secondary",
  ghost: "ds-btn--ghost",
};

/**
 * Primary press button — all CTAs (开始制作 / 下一步 / 生成海报 / 领取身份 …).
 */
export function HandButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: HandButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={["ds-btn", variantClass[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
