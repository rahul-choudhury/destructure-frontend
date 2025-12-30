import { api } from "@/lib/api-client";
import { Blog } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export async function generateStaticParams() {
  return await api.get<Blog[]>("/api/blogs");
}

export default async function Home() {
  const { data: blogs } = await api.get<Blog[]>("/api/blogs");
  return (
    <div className="grid grid-cols-[1fr_minmax(auto,700px)_1fr] gap-x-4 gap-y-8 *:col-start-2">
      <div className="flex flex-col justify-end space-y-4 min-h-30 md:min-h-60">
        <div className="flex gap-2 text-6xl font-serif">
          <span className="text-accent">*</span>
          <h1>destructure</h1>
        </div>
        <div className="md:flex items-center gap-2 hidden text-foreground/50 text-sm">
          <p>
            press <Kbd>/</Kbd> to search
          </p>
          <span>•</span>
          <p>
            use <Kbd>j</Kbd> and <Kbd>k</Kbd> to navigate
          </p>
        </div>
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
              <span>~ {blog.author.name.toLowerCase()}</span>
              <span>{formatDate(blog.createdAt).toLowerCase()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-foreground/10 border border-foreground/20 rounded">
      {children}
    </kbd>
  );
}
