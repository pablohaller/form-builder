import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

const Select = ({ className, ...props }: Props) => (
  <select
    className={`h-9 w-full rounded-md border border-comment bg-current-line px-3 py-2 text-foreground focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple disabled:opacity-50 ${className ?? ""}`}
    {...props}
  />
);

export default Select;
