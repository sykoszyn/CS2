import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d10",
          backgroundImage: "radial-gradient(circle at 50% 30%, #ff5c1a22, transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 20,
              background: "#ff5c1a",
              color: "#0b0d10",
              fontSize: 56,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, color: "#f2f4f7" }}>
            Smoke
            <span style={{ color: "#ff5c1a" }}>AR</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#9aa3b2" }}>
          Aprendé Counter-Strike 2
        </div>
      </div>
    ),
    { ...size },
  );
}
