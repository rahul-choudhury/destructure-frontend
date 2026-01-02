import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function TitleNav({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Link
        href={href}
        className="md:flex gap-1 absolute hidden md:top-30 text-sm opacity-50 hover:opacity-100 transition-opacity items-center"
      >
        <ArrowLeft size={14} />
        Go Back
      </Link>
      {children}
    </div>
  );
}
