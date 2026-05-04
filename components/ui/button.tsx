import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const hasBg = /\bbg-/.test(className);
  const hasText = /\btext-/.test(className);

  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 ${hasBg ? "" : "bg-ink hover:bg-black"} ${hasText ? "" : "text-white"} ${className}`}
      {...props}
    />
  );
}
