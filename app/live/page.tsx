"use client";

import { useState, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";

let _lang = "en";
const t = (ja: string, en: string, lang?: string) =>
  (lang || _lang) === "ja" ? ja : en;

interface LiveStream {
  id: string;
  artist_name: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url?: string;
  stream_url?: string;
}

const FESTIVAL_DATE = new Date("2026-09-04T18:00:00-10:00");

function useCountdown(target: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function timeSince(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export default function LivePage() {
  const [lang, setLang] = useState("en");
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("soluna-lang");
    if (s) setLang(s);
    else if (navigator.language.startsWith("ja")) setLang("ja");
  }, []);
  const toggleLang = () => {
    const n = lang === "ja" ? "en" : "ja";
    setLang(n);
    _lang = n;
    localStorage.setItem("soluna-lang", n);
  };
  _lang = lang;

  useEffect(() => {
    fetch("/api/v1/live")
      .then((r) => r.json())
      .then((d) => {
        setStreams(d.streams || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Poll every 30s
  useEffect(() => {
    const id = setInterval(() => {
      fetch("/api/v1/live")
        .then((r) => r.json())
        .then((d) => setStreams(d.streams || []))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const countdown = useCountdown(FESTIVAL_DATE);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05060a",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <GlobalNav lang={lang} onToggleLang={toggleLang} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          {t("ライブ配信", "LIVE STREAMS")}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 40 }}>
          {t(
            "SOLUNAプラットフォームのリアルタイム配信",
            "Real-time streams on the SOLUNA platform"
          )}
        </p>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px 0",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid rgba(201,169,98,0.2)",
                borderTopColor: "#C9A962",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : streams.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {streams.map((s) => (
              <div
                key={s.id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(201,169,98,0.12)",
                  borderRadius: 16,
                  overflow: "hidden",
                  transition: "border-color 0.3s, transform 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,169,98,0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,169,98,0.12)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%",
                    background:
                      "linear-gradient(135deg, rgba(201,169,98,0.1) 0%, rgba(10,12,18,0.8) 100%)",
                  }}
                >
                  {s.thumbnail_url && (
                    <img
                      src={s.thumbnail_url}
                      alt={s.title}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {/* LIVE badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "#dc2626",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 4,
                      letterSpacing: 1.5,
                    }}
                  >
                    LIVE
                  </span>
                  {/* Viewer count */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      background: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(8px)",
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 12,
                      padding: "3px 10px",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    {formatViewers(s.viewer_count)}
                  </span>
                  {/* Duration */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      background: "rgba(0,0,0,0.7)",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {timeSince(s.started_at)}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: "16px 20px" }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      margin: "0 0 6px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#C9A962",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {s.artist_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No streams — countdown */
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(201,169,98,0.1)",
              borderRadius: 20,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
            <h2
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 28,
                letterSpacing: 2,
                marginBottom: 12,
              }}
            >
              {t(
                "現在ライブ配信はありません",
                "No live streams right now"
              )}
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 15,
                maxWidth: 420,
                margin: "0 auto 32px",
              }}
            >
              {t(
                "次のフェスティバルまでのカウントダウン",
                "Countdown to the next festival"
              )}
            </p>

            {/* Countdown */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              {[
                { val: countdown.days, label: t("日", "Days") },
                { val: countdown.hours, label: t("時間", "Hours") },
                { val: countdown.minutes, label: t("分", "Min") },
                { val: countdown.seconds, label: t("秒", "Sec") },
              ].map(({ val, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "'Anton', sans-serif",
                      fontSize: 42,
                      color: "#C9A962",
                      lineHeight: 1,
                      minWidth: 64,
                    }}
                  >
                    {String(val).padStart(2, "0")}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 6,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                marginTop: 32,
                fontSize: 14,
                color: "#C9A962",
                fontWeight: 500,
              }}
            >
              SOLUNA FEST HAWAII 2026 — Sep 4-6, Oahu
            </p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
