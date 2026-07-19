import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#B8860B",
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 320,
            lineHeight: 1,
          }}
        >
          گ
        </span>
      </div>
    ),
    size
  );
}
