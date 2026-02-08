// import { Kbd } from "@/components/kbd";
import { PageTitle } from "@/components/page-title"
import { getBlogs } from "@/lib/data"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default async function Home() {
  const { data: blogs } = await getBlogs()
  return (
    <>
      <PageTitle className="mb-4">Destructure</PageTitle>
      <p className="mb-8 text-foreground-50">A blog by Rahul &amp; Shakti</p>
      {/*<div className="md:flex items-center gap-2 hidden text-foreground/50 text-sm mb-8">
         <p>
           press <Kbd>/</Kbd> to search
         </p>
         <span>•</span>
         <p>
           use <Kbd>j</Kbd> and <Kbd>k</Kbd> to navigate
         </p>
       </div> */}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            href={blog.slug}
            className="group block rounded-lg border border-foreground-10 p-4 transition-colors hover:border-accent-50"
          >
            <h2 className="text-lg font-medium transition-colors group-hover:text-accent">
              {blog.title}
            </h2>
            <div className="mt-2 flex items-center justify-between text-sm text-foreground-50">
              <span>
                ~ {blog.author.name} • {formatDate(blog.createdAt)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
