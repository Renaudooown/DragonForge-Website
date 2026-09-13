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
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -260,
            width: 820,
            height: 820,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 38% 42%, #b43a12 0%, #8a1e0a 32%, #5a0c08 58%, #1c0306 82%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 88,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              color: "#F3EDE1",
              fontSize: 64,
              letterSpacing: 1,
              fontFamily: "Georgia, serif",
              fontWeight: 300,
            }}
          >
            DragonForge
          </div>
          <div
            style={{
              marginTop: 22,
              color: "rgba(243, 237, 225, 0.58)",
              fontSize: 22,
              letterSpacing: 0.6,
              fontFamily: "Helvetica, sans-serif",
            }}
          >
            The next generation of GPs and LPs.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
