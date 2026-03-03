"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [ja, setJa] = useState(false);
  useEffect(() => { setJa(navigator.language.startsWith("ja")); }, []);
  return (
    <main style={{ background: "#080808", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div className="atmo" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        style={{ textAlign: "center", padding: "40px 24px", position: "relative", zIndex: 1 }}
      >
        <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginBottom: 24 }}>
          ZAMNA HAWAII 2026
        </p>

        <div className="font-display" style={{
          fontSize: "clamp(6rem,25vw,14rem)",
          lineHeight: 0.9,
          color: "rgba(255,255,255,0.05)",
          letterSpacing: "0.04em",
          marginBottom: 24,
          userSelect: "none",
        }}>
          404
        </div>

        <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", margin: "0 auto 28px" }} />

        <h1 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", marginBottom: 16 }}>
          {ja ? "ページが見つかりません" : "Page Not Found"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15, marginBottom: 40, lineHeight: 1.7 }}>
          {ja
            ? "このページは存在しないか、移動した可能性があります。"
            : "The page you're looking for doesn't exist or has moved."}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn-gold" style={{ textDecoration: "none" }}>
            {ja ? "ホームへ戻る" : "Back to Home"}
          </Link>
          <a
            href="https://zamnahawaii.ticketblox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ textDecoration: "none" }}
          >
            {ja ? "チケットを取る" : "Get Tickets"}
          </a>
        </div>
      </motion.div>

      <footer style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em" }}>
          © 2026 ZAMNA HAWAII · Powered by SOLUNA
        </p>
      </footer>
    </main>
  );
}
