import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
