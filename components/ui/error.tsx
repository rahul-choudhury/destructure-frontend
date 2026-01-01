import { cn } from "@/lib/utils";

export type ErrorProps = React.HTMLAttributes<HTMLParagraphElement>;

export function Error({ className, id, ...props }: ErrorProps) {
  return (
    <p
      id={id}
      className={cn("text-sm text-red-500", className)}
      aria-live="polite"
      {...props}
    />
  );
}
