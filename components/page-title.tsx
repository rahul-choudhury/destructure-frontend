import { cn } from "@/lib/utils";

export function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1 className={cn("font-serif text-6xl pt-10 md:pt-40 mb-4", className)}>
      <span className="text-accent mr-2">*</span>
      {children}
    </h1>
  );
}
