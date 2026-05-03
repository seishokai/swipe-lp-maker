import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
      {...props}
    />
  );
}
