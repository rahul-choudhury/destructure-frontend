import { api } from "@/lib/api-client";
import { Blog } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: blog } = await api.get<Blog>(`/api/blogs/details?slug=${slug}`);

  return (
    <>
      <h1 className="font-serif text-6xl pt-10 md:pt-40 mb-4">
        <span className="text-accent mr-2">*</span>
        {blog.title}
      </h1>
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
