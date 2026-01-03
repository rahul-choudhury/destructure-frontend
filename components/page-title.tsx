import { cn } from "@/lib/utils";
import { Braces } from "lucide-react";

export function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "mb-4 flex items-center gap-4 pt-10 font-serif text-6xl md:pt-40",
        className,
      )}
    >
      <Braces className="text-accent" size={50} />
      {children}
    </h1>
  );
}
