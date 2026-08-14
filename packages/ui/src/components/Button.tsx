import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",

        variant === "primary" &&
          "bg-black text-white hover:bg-neutral-800",

        variant === "secondary" &&
          "bg-neutral-200 text-black hover:bg-neutral-300",

        variant === "ghost" &&
          "hover:bg-neutral-100",

        size === "sm" && "px-3 py-1.5 text-sm",

        size === "md" && "px-4 py-2",

        size === "lg" && "px-6 py-3 text-lg",

        className
      )}
      {...props}
    />
  );
}
