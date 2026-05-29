import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-purple text-background hover:bg-purple/90 active:bg-purple/80",
  secondary:
    "border border-comment text-foreground bg-transparent hover:bg-current-line hover:border-purple active:bg-current-line/70",
  danger: "bg-red text-background hover:bg-red/90 active:bg-red/80",
  ghost: "text-foreground bg-transparent hover:bg-current-line active:bg-current-line/70",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm min-h-9 min-w-9",
  md: "px-4 py-2 text-base min-h-11 min-w-11",
  lg: "px-6 py-3 text-lg min-h-13 min-w-13",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors cursor-pointer " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

const Button = ({ variant = "primary", size = "md", className = "", ...props }: Props) => (
  <button
    className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    {...props}
  />
);

export default Button;
