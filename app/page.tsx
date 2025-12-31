import { Kbd } from "@/components/kbd";
import { PageTitle } from "@/components/page-title";
import { api } from "@/lib/api-client";
import { Blog } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function Home() {
  const { data: blogs } = await api.get<Blog[]>("/api/blogs");
  return (
    <>
      <PageTitle>destructure</PageTitle>
      <div className="md:flex items-center gap-2 hidden text-foreground/50 text-sm mb-8">
        <p>
          press <Kbd>/</Kbd> to search
        </p>
        <span>•</span>
        <p>
          use <Kbd>j</Kbd> and <Kbd>k</Kbd> to navigate
        </p>
      </div>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            href={blog.slug}
            className="block group p-4 border border-foreground/10 rounded-lg hover:border-accent/50 transition-colors"
          >
            <h2 className="text-lg font-medium group-hover:text-accent transition-colors">
              {blog.title.toLowerCase()}
            </h2>
            <div className="flex items-center justify-between mt-2 text-sm text-foreground/50">
              <span>~{blog.author.name.toLowerCase()} • {formatDate(blog.createdAt).toLowerCase()}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
