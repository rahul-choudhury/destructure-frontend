import type { Metadata } from "next";
import { BlogContent } from "@/components/blog-content";
import { PageTitle } from "@/components/page-title";
import { TitleNav } from "@/components/title-nav";
import { processHtml } from "@/lib/process-html";
import { api } from "@/lib/api-client";
import { Blog } from "@/lib/definitions";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const blogs = await api.get<Blog[]>("/api/blogs");
  return blogs.data.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: blog } = await api.get<Blog>(`/api/blogs/details?slug=${slug}`);

  return {
    title: blog.title,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: blog } = await api.get<Blog>(`/api/blogs/details?slug=${slug}`);
  const processedContent = await processHtml(blog.content);

  return (
    <>
      <TitleNav href="/">
        <PageTitle>{blog.title}</PageTitle>
      </TitleNav>
      <div className="mb-8 flex justify-between text-sm text-foreground-50">
        <p>{formatDate(blog.createdAt)}</p>
        <p>~ {blog.author.name}</p>
      </div>
      <BlogContent html={processedContent} />
    </>
  );
}
