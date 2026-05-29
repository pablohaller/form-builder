import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, ...props }: Props) => (
  <input
    className={`h-9 w-full rounded-md border border-comment bg-current-line px-3 py-2 text-foreground placeholder:text-comment focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple disabled:opacity-50 ${className ?? ""}`}
    {...props}
  />
);

export default Input;
