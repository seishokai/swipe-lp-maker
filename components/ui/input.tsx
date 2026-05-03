import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-accent/15 ${className}`}
      {...props}
    />
  );
}
