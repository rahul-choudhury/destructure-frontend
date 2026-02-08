"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex active:scale-[0.97] items-center justify-center gap-1 rounded-md font-medium transition-[colors,transform] data-disabled:opacity-50 data-disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground-90",
        outline:
          "border border-foreground-10 hover:border-accent-50 hover:bg-foreground-5",
        ghost:
          "text-foreground-60 hover:bg-foreground-10 hover:text-foreground",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        reaction:
          "rounded-full border border-foreground-10 hover:border-foreground-20 data-[active]:border-accent data-[active]:bg-accent/10 data-[active]:text-accent",
      },
      size: {
        default: "px-4 py-2 text-sm",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof BaseButton> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
