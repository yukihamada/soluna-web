const std = @import("std");

pub fn nftPassSvg(buf: []u8, pass_type: []const u8, num: []const u8) []const u8 {
    const is_artist = std.mem.eql(u8, pass_type, "artist");
    const color = if (is_artist) "#4ade80" else "#C9A962";
    const title = if (is_artist) "ARTIST PASS" else "VIP PASS";
    const symbol = if (is_artist) "ZART" else "ZVIP";

    return std.fmt.bufPrint(buf,
        \\<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        \\<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a0a0a"/><stop offset="100%" stop-color="#1a1a2e"/></linearGradient></defs>
        \\<rect width="400" height="400" fill="url(#bg)"/>
        \\<rect x="20" y="20" width="360" height="360" rx="24" fill="none" stroke="{s}" stroke-width="1" opacity="0.3"/>
        \\<text x="200" y="100" text-anchor="middle" fill="{s}" font-family="sans-serif" font-size="11" letter-spacing="8" opacity="0.6">ZAMNA HAWAII</text>
        \\<text x="200" y="170" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="36" font-weight="700" letter-spacing="4">{s}</text>
        \\<text x="200" y="210" text-anchor="middle" fill="{s}" font-family="monospace" font-size="48" font-weight="700">#{s}</text>
        \\<text x="200" y="260" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="sans-serif" font-size="12" letter-spacing="3">{s} · SEP 4-5, 2026</text>
        \\<text x="200" y="290" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="sans-serif" font-size="10" letter-spacing="2">MOANALUA GARDENS · OAHU</text>
        \\<text x="200" y="350" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-family="sans-serif" font-size="9" letter-spacing="4">SOLANA · DEVNET</text>
        \\</svg>
    , .{ color, color, title, color, num, symbol }) catch "<svg/>";
}
