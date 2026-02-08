import { ImageResponse } from "next/og"

export const alt = "Destructure"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  const instrumentSerifFont = await fetch(
    "https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-2zI.ttf",
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    <div
      style={{
        background: "#222222",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontFamily: "Instrument Serif",
          color: "#faf3e1",
        }}
      >
        <span style={{ color: "#ff6d1f" }}>{"{"}</span>
        Destructure
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
  )
}
