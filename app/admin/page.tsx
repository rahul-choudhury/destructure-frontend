import Link from "next/link";

import { PageTitle } from "@/components/page-title";
import { ToggleVisibilityButton } from "@/components/toggle-visibility-button";
import { api } from "@/lib/api-client";
import { Blog, User } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";
import { getTokenFromCookie } from "@/lib/utils.server";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <PageTitle className="mb-0">hello {firstName}!</PageTitle>
        <Button
          render={<Link href="/admin/blogs/create" />}
          nativeButton={false}
        >
          <PlusIcon size={16} />
          blog
        </Button>
      </div>
      <p className="mb-8 text-foreground/50">manage your blogs</p>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            href={`/admin/blogs/${blog.slug}`}
            className="group block rounded-lg border border-foreground/10 p-4 transition-colors hover:border-accent/50"
          >
            <h2 className="text-lg font-medium transition-colors group-hover:text-accent">
              {blog.title.toLowerCase()}
            </h2>
            <div className="mt-2 flex items-center justify-between text-sm text-foreground/50">
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
