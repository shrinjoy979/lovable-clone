import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full resize-none rounded-md border border-neutral-300 px-3 py-2 outline-none",
        "focus:ring-2 focus:ring-black",
        className
      )}
      {...props}
    />
  );
}