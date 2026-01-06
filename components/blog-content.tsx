"use client";

import parse, { DOMNode, Element } from "html-react-parser";
import { VideoPlayer } from "./video-player";

function extractVideoDimensions(src: string) {
  try {
    const url = new URL(src);
    const width = url.searchParams.get("width");
    const height = url.searchParams.get("height");
    return {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
    };
  } catch {
    return {};
  }
}

export function BlogContent({ html }: { html: string }) {
  return (
    <article className="blog-content min-w-0">
      {parse(html, {
        replace: (domNode: DOMNode) => {
          if (domNode instanceof Element && domNode.name === "video") {
            const { width, height } = extractVideoDimensions(
              domNode.attribs.src,
            );
            return (
              <VideoPlayer
                src={domNode.attribs.src}
                width={width}
                height={height}
              />
            );
          }
        },
      })}
    </article>
  );
}
