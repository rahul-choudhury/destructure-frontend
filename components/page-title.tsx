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
        "font-serif text-6xl pt-10 md:pt-40 mb-4 gap-4 flex items-center",
        className,
      )}
    >
      <Braces className="text-accent" size={50} />
      {children}
    </h1>
  );
}
