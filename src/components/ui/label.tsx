import type { LabelHTMLAttributes } from "react";

type Props = LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({ className, ...props }: Props) => (
  <label
    className={`text-sm font-medium text-foreground ${className ?? ""}`}
    {...props}
  />
);

export default Label;
