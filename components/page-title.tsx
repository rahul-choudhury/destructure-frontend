import { cn } from "@/lib/utils"

export function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h1
      className={cn(
        "mt-20 mb-4 border-l-4 border-accent pl-4 font-serif text-6xl md:mt-40",
        className,
      )}
    >
      {children}
    </h1>
  )
}
