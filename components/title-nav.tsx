import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function TitleNav({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Link
        href={href}
        className="absolute top-10 flex items-center gap-1 text-sm opacity-50 transition-opacity hover:opacity-100 md:top-30"
      >
        <ArrowLeft size={14} />
        Go Back
      </Link>
      {children}
    </div>
  )
}
