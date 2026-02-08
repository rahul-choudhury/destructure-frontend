import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  htmlFor: string;
};

export function Label({ className, htmlFor, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: This is a reusable component, htmlFor is always provided by consumers
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
