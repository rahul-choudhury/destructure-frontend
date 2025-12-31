import { PageTitle } from "@/components/page-title";
import { api } from "@/lib/api-client";
import { Blog } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";
import { getTokenFromCookie } from "@/lib/utils.server";

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

  return (
    <>
      <PageTitle>{blog.title}</PageTitle>
      <div className="text-sm text-foreground/50 mb-8 flex justify-between">
        <p>{formatDate(blog.createdAt)}</p>
        <p>~ {blog.author.name}</p>
      </div>
      <article
        className="blog-content pb-10 min-w-0"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </>
  );
}
