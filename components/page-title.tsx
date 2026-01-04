import { cn } from "@/lib/utils";

export function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1 className={cn("mb-4 pt-10 font-serif text-6xl md:pt-40", className)}>
      <span className="text-accent">{"{"}</span>
      {children}
      <span className="text-accent">{"}"}</span>
    </h1>
  );
}
