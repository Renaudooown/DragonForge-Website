import { ImageResponse } from "next/og";
import { site } from "@/lib/copy";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#00022C",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 168,
            height: 168,
            borderRadius: 999,
            background: "#ff8a3a",
            boxShadow: "0 0 80px 30px rgba(255, 90, 30, 0.45)",
          }}
        />
        <div
          style={{
            marginTop: 52,
            color: "#F3EDE1",
            fontSize: 54,
            letterSpacing: 16,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
          }}
        >
          DragonForge
        </div>
      </div>
    ),
    { ...size },
  );
}
