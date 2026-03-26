"use client";

import { useState, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";

let _lang = "en";
const t = (ja: string, en: string, lang?: string) =>
  (lang || _lang) === "ja" ? ja : en;

interface ArtistChannel {
  slug: string;
  name: string;
  creator: string;
  track_count: number;
  description?: string;
  cover_url?: string;
  listener_count?: number;
}

interface Playlist {
  id: string;
  name: string;
  creator: string;
  track_count: number;
  cover_url?: string;
  description?: string;
}

interface LiveStream {
  id: string;
  artist_name: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url?: string;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function CommunityPage() {
  const [lang, setLang] = useState("en");
  const [channels, setChannels] = useState<ArtistChannel[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());

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
    Promise.all([
      fetch("/api/v1/explore/radios")
        .then((r) => r.json())
        .then((d) => setChannels(d.radios || []))
        .catch(() => {}),
      fetch("/api/v1/explore/playlists")
        .then((r) => r.json())
        .then((d) => setPlaylists(d.playlists || []))
        .catch(() => {}),
      fetch("/api/v1/live")
        .then((r) => r.json())
        .then((d) => setStreams(d.streams || []))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const toggleFollow = (id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(201,169,98,0.12)",
    borderRadius: 16,
    overflow: "hidden",
    transition: "border-color 0.3s, transform 0.3s",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "'Anton', sans-serif",
    fontSize: "clamp(22px, 3vw, 32px)",
    letterSpacing: 2,
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 12,
  };

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
        {/* Page title */}
        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          {t("コミュニティ", "COMMUNITY")}
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 15,
            marginBottom: 48,
          }}
        >
          {t(
            "アーティスト、プレイリスト、ライブ配信を探索",
            "Discover artists, playlists, and live streams"
          )}
        </p>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
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
        ) : (
          <>
            {/* ── Section 1: Popular Artists ── */}
            <section style={{ marginBottom: 56 }}>
              <h2 style={sectionTitleStyle}>
                <span style={{ fontSize: 24 }}>🎤</span>
                {t("人気アーティスト", "Popular Artists")}
              </h2>

              {channels.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                  {t("アーティストチャンネルはまだありません", "No artist channels yet")}
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 20,
                  }}
                >
                  {channels.map((ch) => (
                    <a
                      key={ch.slug}
                      href={`/radio/${ch.slug}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={cardStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(201,169,98,0.4)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(201,169,98,0.12)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {/* Avatar area */}
                        <div
                          style={{
                            height: 120,
                            background:
                              "linear-gradient(135deg, rgba(201,169,98,0.15) 0%, rgba(10,12,18,0.9) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {ch.cover_url ? (
                            <img
                              src={ch.cover_url}
                              alt={ch.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #C9A962, #8B7440)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                                fontWeight: 700,
                                color: "#05060a",
                              }}
                            >
                              {ch.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div style={{ padding: "16px 20px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <h3
                                style={{
                                  fontSize: 15,
                                  fontWeight: 600,
                                  margin: "0 0 4px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {ch.name}
                              </h3>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.45)",
                                  margin: 0,
                                }}
                              >
                                {ch.creator} · {ch.track_count}{" "}
                                {t("曲", "tracks")}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFollow(ch.slug);
                              }}
                              style={{
                                flexShrink: 0,
                                background: following.has(ch.slug)
                                  ? "rgba(201,169,98,0.2)"
                                  : "transparent",
                                border: `1px solid ${
                                  following.has(ch.slug)
                                    ? "#C9A962"
                                    : "rgba(255,255,255,0.2)"
                                }`,
                                color: following.has(ch.slug)
                                  ? "#C9A962"
                                  : "rgba(255,255,255,0.6)",
                                padding: "4px 14px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              {following.has(ch.slug)
                                ? t("フォロー中", "Following")
                                : t("フォロー", "Follow")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>

            {/* ── Section 2: Playlists ── */}
            <section style={{ marginBottom: 56 }}>
              <h2 style={sectionTitleStyle}>
                <span style={{ fontSize: 24 }}>🎵</span>
                {t("プレイリスト", "Playlists")}
              </h2>

              {playlists.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                  {t("プレイリストはまだありません", "No playlists yet")}
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 20,
                  }}
                >
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      style={cardStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(201,169,98,0.4)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(201,169,98,0.12)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Cover */}
                      <div
                        style={{
                          width: "100%",
                          paddingTop: "100%",
                          position: "relative",
                          background:
                            "linear-gradient(135deg, rgba(201,169,98,0.12) 0%, rgba(10,12,18,0.9) 100%)",
                        }}
                      >
                        {pl.cover_url ? (
                          <img
                            src={pl.cover_url}
                            alt={pl.name}
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              width="40"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="rgba(201,169,98,0.3)"
                            >
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                          </div>
                        )}
                        {/* Track count badge */}
                        <span
                          style={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            background: "rgba(0,0,0,0.7)",
                            backdropFilter: "blur(8px)",
                            color: "rgba(255,255,255,0.8)",
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {pl.track_count} {t("曲", "tracks")}
                        </span>
                      </div>

                      <div style={{ padding: "14px 16px" }}>
                        <h3
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            margin: "0 0 4px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {pl.name}
                        </h3>
                        <p
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            margin: 0,
                          }}
                        >
                          by {pl.creator}
                        </p>
                        {pl.description && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.3)",
                              margin: "6px 0 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pl.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Section 3: Live Now ── */}
            <section style={{ marginBottom: 56 }}>
              <h2 style={sectionTitleStyle}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: streams.length > 0 ? "#dc2626" : "rgba(255,255,255,0.2)",
                    animation: streams.length > 0 ? "pulse 2s infinite" : "none",
                    display: "inline-block",
                  }}
                />
                {t("ライブ配信中", "Live Now")}
                {streams.length > 0 && (
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    ({streams.length})
                  </span>
                )}
              </h2>

              {streams.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(201,169,98,0.08)",
                    borderRadius: 16,
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 14,
                      margin: 0,
                    }}
                  >
                    {t(
                      "現在ライブ配信はありません",
                      "No live streams right now"
                    )}
                  </p>
                  <a
                    href="/live"
                    style={{
                      display: "inline-block",
                      marginTop: 12,
                      color: "#C9A962",
                      fontSize: 13,
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    {t("ライブページを見る →", "View live page →")}
                  </a>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 20,
                  }}
                >
                  {streams.map((s) => (
                    <a
                      key={s.id}
                      href="/live"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={cardStyle}
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
                            paddingTop: "50%",
                            background:
                              "linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(10,12,18,0.9) 100%)",
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
                          <span
                            style={{
                              position: "absolute",
                              top: 10,
                              left: 10,
                              background: "#dc2626",
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 4,
                              letterSpacing: 1.5,
                            }}
                          >
                            LIVE
                          </span>
                          <span
                            style={{
                              position: "absolute",
                              bottom: 10,
                              right: 10,
                              background: "rgba(0,0,0,0.7)",
                              color: "rgba(255,255,255,0.8)",
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                            {formatCount(s.viewer_count)}
                          </span>
                        </div>

                        <div style={{ padding: "14px 18px" }}>
                          <h3
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              margin: "0 0 4px",
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
                    </a>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(201,169,98,0.1)",
          padding: "24px 32px",
          textAlign: "center",
          color: "rgba(255,255,255,0.3)",
          fontSize: 12,
        }}
      >
        SOLUNA &copy; 2026 &middot;{" "}
        <a href="/music" style={{ color: "rgba(201,169,98,0.6)", textDecoration: "none" }}>
          {t("音楽", "Music")}
        </a>{" "}
        &middot;{" "}
        <a href="/live" style={{ color: "rgba(201,169,98,0.6)", textDecoration: "none" }}>
          {t("ライブ", "Live")}
        </a>{" "}
        &middot;{" "}
        <a href="/artist" style={{ color: "rgba(201,169,98,0.6)", textDecoration: "none" }}>
          {t("アーティスト", "Artists")}
        </a>
      </footer>

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
