import { BlogForm } from "@/components/blog-form";
import { PageTitle } from "@/components/page-title";
import { TitleNav } from "@/components/title-nav";

export default function Page() {
  return (
    <>
      <TitleNav href="/admin">
        <PageTitle>New Blog</PageTitle>
      </TitleNav>
      <BlogForm />
    </>
  );
}
