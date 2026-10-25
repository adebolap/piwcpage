import { ImageResponse } from "next/og";

export const alt = "PIWC Antwerp: The Centre where God lives";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3eee6",
          color: "#1a1614",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 3, color: "#7a2433" }}>
          PENTECOST INTERNATIONAL WORSHIP CENTRE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, lineHeight: 0.95 }}>PIWC Antwerp</div>
          <div style={{ display: "flex", fontSize: 40, marginTop: 28 }}>The Centre where God lives</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#4e463f" }}>
          Merksemsesteenweg 32/34 · 2100 Antwerpen
        </div>
      </div>
    ),
    { ...size },
  );
}
