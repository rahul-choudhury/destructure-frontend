import { ImageResponse } from "next/og";

import { api } from "@/lib/api-client";
import { Blog } from "@/lib/definitions";

export async function generateStaticParams() {
  const blogs = await api.get<Blog[]>("/api/blogs");
  return blogs.data.map((blog) => ({
    slug: blog.slug,
  }));
}

export const alt = "Destructure";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ data: blog }, interFont] = await Promise.all([
    api.get<Blog>(`/api/blogs/details?slug=${slug}`),
    fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf"
    ).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#222222",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: 80,
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ff6d1f"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
          <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
        </svg>
        <div
          style={{
            fontSize: 56,
            fontFamily: "Inter",
            fontWeight: 600,
            color: "#faf3e1",
            lineHeight: 1.2,
          }}
        >
          {blog.title}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interFont,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
