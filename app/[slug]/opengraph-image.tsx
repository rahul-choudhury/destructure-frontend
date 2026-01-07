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

  const [{ data: blog }, instrumentSerifFont] = await Promise.all([
    api.get<Blog>(`/api/blogs/details?slug=${slug}`),
    fetch(
      "https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-2zI.ttf",
    ).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    <div
      style={{
        background: "#222222",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 56,
          fontFamily: "Instrument Serif",
          color: "#faf3e1",
          lineHeight: 1.2,
        }}
      >
        <span style={{ color: "#ff6d1f" }}>{"{"}</span>
        {blog.title}
        <span style={{ color: "#ff6d1f" }}>{"}"}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Instrument Serif",
          data: instrumentSerifFont,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
