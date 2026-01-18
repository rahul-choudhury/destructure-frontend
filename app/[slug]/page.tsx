import type { Metadata } from "next";
import { BlogContent } from "@/components/blog-content";
import { PageTitle } from "@/components/page-title";
import { TitleNav } from "@/components/title-nav";
import { TableOfContents } from "@/components/table-of-contents";
import { processHtml } from "@/lib/process-html";
import { formatDate } from "@/lib/utils";
import { Interactions } from "@/components/interactions";
import { getBlog, getBlogs } from "@/lib/data";

export async function generateStaticParams() {
  const blogs = await getBlogs();
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
  const { data: blog } = await getBlog(slug);

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
  const { data: blog } = await getBlog(slug);
  const { html, toc } = await processHtml(blog.content);

  return (
    <>
      <TitleNav href="/">
        <PageTitle>{blog.title}</PageTitle>
      </TitleNav>
      <div className="mb-8 flex justify-between text-sm text-foreground-50">
        <p>{formatDate(blog.createdAt)}</p>
        <p>~ {blog.author.name}</p>
      </div>
      <TableOfContents toc={toc} />
      <BlogContent html={html} />
      <Interactions slug={slug} />
    </>
  );
}
