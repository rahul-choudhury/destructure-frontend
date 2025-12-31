import { Input as BaseInput } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<typeof BaseInput>;

export function Input({ className, ...props }: InputProps) {
  return (
    <BaseInput
      className={cn(
        "h-10 w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-2 focus:outline-accent focus:-outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
