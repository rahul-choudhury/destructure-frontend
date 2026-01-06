import { Pencil } from "lucide-react";
import Link from "next/link";

import { BlogContent } from "@/components/blog-content";
import { DeleteBlogButton } from "@/components/delete-blog-button";
import { PageTitle } from "@/components/page-title";
import { api } from "@/lib/api-client";
import { Blog } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";
import { getTokenFromCookie } from "@/lib/utils.server";
import { TitleNav } from "@/components/title-nav";
import { processHtml } from "@/lib/process-html";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const token = await getTokenFromCookie();
  const { slug } = await params;
  const { data: blog } = await api.get<Blog>(
    `/api/blogs/details?slug=${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const processedContent = await processHtml(blog.content);

  return (
    <>
      <TitleNav href="/admin">
        <PageTitle>{blog.title}</PageTitle>
      </TitleNav>
      <div className="mb-8 flex justify-between text-sm text-foreground-50">
        <p>
          {formatDate(blog.createdAt)} •{" "}
          <Link
            href={`/admin/blogs/${slug}/edit`}
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            <Pencil className="size-3" />
            Edit
          </Link>{" "}
          • <DeleteBlogButton slug={slug} />
        </p>
        <p>~ {blog.author.name}</p>
      </div>
      <BlogContent html={processedContent} />
    </>
  );
}
