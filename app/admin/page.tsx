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

  const firstName = profile.name.split(" ")[0];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <PageTitle className="mb-0">Hello {firstName}!</PageTitle>
        <Button
          render={<Link href="/admin/blogs/create" />}
          nativeButton={false}
          className="hidden md:inline-flex"
        >
          <PlusIcon size={16} />
          Blog
        </Button>
      </div>
      <p className="mb-8 text-foreground-50">Manage your blogs</p>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            href={`/admin/blogs/${blog.slug}`}
            className="group block rounded-lg border border-foreground-10 p-4 transition-colors hover:border-accent-50"
          >
            <h2 className="text-lg font-medium transition-colors group-hover:text-accent">
              {blog.title}
            </h2>
            <div className="mt-2 flex items-center justify-between text-sm text-foreground-50">
              <span>
                ~ {blog.author.name} • {formatDate(blog.createdAt)}
              </span>
              <ToggleVisibilityButton
                slug={blog.slug}
                isPublic={blog.isPublic}
              />
            </div>
          </Link>
        ))}
      </div>
      <Button
        render={<Link href="/admin/blogs/create" />}
        nativeButton={false}
        className="fixed right-4 bottom-4 aspect-square items-center justify-center md:hidden"
      >
        <PlusIcon size={20} />
      </Button>
    </>
  );
}
