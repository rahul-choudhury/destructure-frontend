import Link from "next/link";

import { PageTitle } from "@/components/page-title";
import { ToggleVisibilityButton } from "@/components/toggle-visibility-button";
import { api } from "@/lib/api-client";
import { Blog, User } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";
import { getTokenFromCookie } from "@/lib/utils.server";
import { PlusIcon } from "lucide-react";

export default async function Page() {
  const token = await getTokenFromCookie();
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [{ data: profile }, { data: blogs }] = await Promise.all([
    api.get<User>("/api/auth/profile", authHeader),
    api.get<Blog[]>("/api/admin/blog", authHeader),
  ]);

  const firstName = profile.name.split(" ")[0].toLowerCase();

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
        <PageTitle className="mb-0">hello {firstName}!</PageTitle>
        <Link
          href="/admin/blog/create"
          className="inline-flex items-center gap-1 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium"
        >
          <PlusIcon size={16} />
          blog
        </Link>
      </div>
      <p className="text-foreground/50 mb-8">manage your blogs</p>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            href={`/admin/${blog.slug}`}
            className="block group p-4 border border-foreground/10 rounded-lg hover:border-accent/50 transition-colors"
          >
            <h2 className="text-lg font-medium group-hover:text-accent transition-colors">
              {blog.title.toLowerCase()}
            </h2>
            <div className="flex items-center justify-between mt-2 text-sm text-foreground/50">
              <span>
                ~{blog.author.name.toLowerCase()} •{" "}
                {formatDate(blog.createdAt).toLowerCase()}
              </span>
              <ToggleVisibilityButton
                slug={blog.slug}
                isPublic={blog.isPublic}
              />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
