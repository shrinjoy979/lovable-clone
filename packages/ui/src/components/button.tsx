import { cn } from "../lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("rounded-md px-4 py-2 font-medium", className)}
      {...props}
    />
  );
}
