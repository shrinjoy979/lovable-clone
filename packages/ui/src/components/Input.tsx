import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-neutral-300 px-3 py-2 outline-none",
        "focus:ring-2 focus:ring-black",
        className
      )}
      {...props}
    />
  );
}
