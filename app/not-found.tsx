import { PageTitle } from "@/components/page-title"
import Link from "next/link"

export default function NotFound() {
  return (
    <>
      <PageTitle>Not Found</PageTitle>
      <p className="mb-6 text-foreground-50">
        But perhaps getting lost is how we find something better.
      </p>
      <div className="mb-12 border-l-2 border-foreground-20 pl-4">
        <p className="font-serif text-xl italic text-foreground-60">
          &ldquo;I have always imagined that Paradise will be a kind of
          library.&rdquo;
        </p>
        <p className="mt-2 text-sm text-foreground-40">— Jorge Luis Borges</p>
      </div>
      <Link
        href="/"
        className="group inline-flex w-fit items-center gap-2 text-foreground-50 transition-colors hover:text-accent"
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Return home
      </Link>
    </>
  )
}
