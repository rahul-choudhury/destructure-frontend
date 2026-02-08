import { connection } from "next/server";
import { BlogForm } from "@/components/blog-form";
import { PageTitle } from "@/components/page-title";
import { TitleNav } from "@/components/title-nav";

export default async function Page() {
  // without a unique key, navigating away and back preserves stale client state (editor content, form fields).
  // crypto.randomUUID() generates a new key per navigation, forcing React to remount BlogForm with a clean slate.
  // connection() opts into dynamic rendering, which is required for crypto.randomUUID() during prerendering.
  await connection();
  return (
    <>
      <TitleNav href="/admin">
        <PageTitle>New Blog</PageTitle>
      </TitleNav>
      <BlogForm key={crypto.randomUUID()} />
    </>
  );
}
