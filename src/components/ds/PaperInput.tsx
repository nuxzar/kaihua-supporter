"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function PaperLabel({
  children,
  htmlFor,
  className = "",
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  const cls = ["ds-label", className].filter(Boolean).join(" ");
  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={cls}>
        {children}
      </label>
    );
  }
  return <span className={cls}>{children}</span>;
}

type PaperInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

/**
 * Design-system text field — border / fill / shadow only via .ds-input.
 */
export function PaperInput({ label, className = "", id, ...rest }: PaperInputProps) {
  const inputId = id ?? (typeof rest.name === "string" ? rest.name : undefined);
  return (
    <div className={["flex w-full flex-col", "ds-gap-sm", className].filter(Boolean).join(" ")}>
      {label ? <PaperLabel htmlFor={inputId}>{label}</PaperLabel> : null}
      <input id={inputId} className="ds-input" {...rest} />
    </div>
  );
}

type PaperTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function PaperTextarea({ label, className = "", id, ...rest }: PaperTextareaProps) {
  const inputId = id ?? (typeof rest.name === "string" ? rest.name : undefined);
  return (
    <div className={["flex w-full flex-col", "ds-gap-sm", className].filter(Boolean).join(" ")}>
      {label ? <PaperLabel htmlFor={inputId}>{label}</PaperLabel> : null}
      <textarea id={inputId} className="ds-input resize-none" {...rest} />
    </div>
  );
}

/** @deprecated Use PaperInput */
export const HandInput = PaperInput;
/** @deprecated Use PaperTextarea */
export const HandTextarea = PaperTextarea;
/** @deprecated Use PaperLabel */
export const HandLabel = PaperLabel;
