export const dynamic = "force-static";
import { ImageResponse } from "next/og";

export const alt = "SOLUNA FEST HAWAII 2026 — Sep 4–6, Oahu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080808",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Background gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,169,98,0.08) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Top label */}
        <div style={{
          fontSize: 14, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)",
          textTransform: "uppercase", marginBottom: 40, display: "flex",
        }}>
          UNDERGROUND ELECTRONIC MUSIC
        </div>

        {/* Gold line */}
        <div style={{ width: 48, height: 3, background: "#C9A962", marginBottom: 40, display: "flex" }} />

        {/* Main title */}
        <div style={{
          fontSize: 96, fontWeight: 900, color: "#ffffff",
          letterSpacing: "0.1em", marginBottom: 20, display: "flex",
        }}>
          SOLUNA FEST HAWAII
        </div>

        {/* Date */}
        <div style={{
          fontSize: 36, color: "#C9A962", letterSpacing: "0.25em",
          marginBottom: 20, display: "flex",
        }}>
          2026 · SEP 4–6 · OAHU
        </div>

        {/* Tickets */}
        <div style={{
          fontSize: 18, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em",
          display: "flex", marginTop: 8,
        }}>
          TICKETS FROM $120 · VIP FROM $1,000
        </div>

        {/* Gold line bottom */}
        <div style={{ width: 48, height: 3, background: "#C9A962", marginTop: 40, display: "flex" }} />

        {/* Footer */}
        <div style={{
          position: "absolute", bottom: 40,
          fontSize: 13, color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em", display: "flex",
        }}>
          POWERED BY SOLUNA · solun.art
        </div>
      </div>
    ),
    size,
  );
}
