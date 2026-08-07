import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ea580c",
        color: "#fff",
        fontSize: 108,
        fontWeight: 700,
        fontFamily: "Georgia, serif",
      }}
    >
      B
    </div>,
    { ...size },
  );
}
