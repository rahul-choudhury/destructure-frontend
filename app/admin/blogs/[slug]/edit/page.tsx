import { BlogForm } from "@/components/blog-form";
import { PageTitle } from "@/components/page-title";
import { TitleNav } from "@/components/title-nav";
import { api } from "@/lib/api-client";
import { Blog } from "@/lib/definitions";
import { getTokenFromCookie } from "@/lib/utils.server";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getTokenFromCookie();

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
      <TitleNav href={`/admin/blogs/${slug}`}>
        <PageTitle>Edit Blog</PageTitle>
      </TitleNav>
      <BlogForm data={blog} />
    </>
  );
}
