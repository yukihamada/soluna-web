"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GlobalNav from "@/components/GlobalNav";

let _lang = "en";
const t = (ja: string, en: string) => _lang === "ja" ? ja : en;
const gold = "#C9A962";

// ── Types ────────────────────────────────────────────────────────────────────

interface Contest {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  status?: string;
  entry_count?: number;
  total_votes?: number;
}

interface Entry {
  id: string;
  track_id: string;
  title: string;
  artist: string;
  cover_url?: string;
  stream_url?: string;
  votes: number;
}

interface UserTrack {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
}

// ── EQ Bars Animation (CSS-in-JS keyframes injected once) ────────────────────

function injectKeyframes() {
  if (typeof window === "undefined") return;
  if (document.getElementById("soluna-eq-keyframes")) return;
  const style = document.createElement("style");
  style.id = "soluna-eq-keyframes";
  style.textContent = `
    @keyframes soluna-eq-1 { 0%,100%{height:4px} 50%{height:18px} }
    @keyframes soluna-eq-2 { 0%,100%{height:8px} 50%{height:24px} }
    @keyframes soluna-eq-3 { 0%,100%{height:6px} 50%{height:20px} }
    @keyframes soluna-eq-4 { 0%,100%{height:10px} 50%{height:16px} }
    @keyframes soluna-vote-pop { 0%{transform:scale(1)} 40%{transform:scale(1.25)} 100%{transform:scale(1)} }
    @keyframes soluna-bar-grow { from{width:0} to{width:var(--bar-w)} }
    @keyframes soluna-pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
  `;
  document.head.appendChild(style);
}

function EqBars({ playing }: { playing: boolean }) {
  if (!playing) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: gold,
            animation: `soluna-eq-${i} ${0.4 + i * 0.15}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function ContestsPage() {
  const [lang, setLang] = useState("en");
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [voteAnimId, setVoteAnimId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTracks, setUserTracks] = useState<UserTrack[]>([]);
  const [enteringTrackId, setEnteringTrackId] = useState<string | null>(null);
  const [showEnterSection, setShowEnterSection] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Init ──
  useEffect(() => {
    injectKeyframes();
    const s = localStorage.getItem("soluna-lang");
    if (s) setLang(s);
    else if (navigator.language.startsWith("ja")) setLang("ja");
    setIsLoggedIn(!!localStorage.getItem("soluna-token"));
  }, []);

  const toggleLang = () => {
    const n = lang === "ja" ? "en" : "ja";
    setLang(n);
    _lang = n;
    localStorage.setItem("soluna-lang", n);
  };
  _lang = lang;

  // ── Fetch contests ──
  useEffect(() => {
    fetch("/api/v1/contests")
      .then((r) => r.json())
      .then((d) => {
        setContests(d.contests || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Select contest → fetch entries ──
  const selectContest = useCallback((c: Contest) => {
    setSelectedContest(c);
    setEntriesLoading(true);
    setEntries([]);
    fetch(`/api/v1/contests/${c.id}`)
      .then((r) => r.json())
      .then((d) => {
        setEntries((d.entries || []).sort((a: Entry, b: Entry) => b.votes - a.votes));
        setEntriesLoading(false);
      })
      .catch(() => setEntriesLoading(false));
  }, []);

  // ── Vote ──
  const vote = useCallback(async (entryId: string) => {
    if (!selectedContest || votedIds.has(entryId)) return;
    try {
      await fetch(`/api/v1/contests/${selectedContest.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(localStorage.getItem("soluna-token") ? { Authorization: `Bearer ${localStorage.getItem("soluna-token")}` } : {}) },
        body: JSON.stringify({ entry_id: entryId }),
      });
      setVotedIds((prev) => new Set(prev).add(entryId));
      setVoteAnimId(entryId);
      setTimeout(() => setVoteAnimId(null), 500);
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, votes: e.votes + 1 } : e)).sort((a, b) => b.votes - a.votes)
      );
    } catch { /* silently fail */ }
  }, [selectedContest, votedIds]);

  // ── Play / pause ──
  const togglePlay = useCallback((entry: Entry) => {
    const a = audioRef.current;
    if (!a || !entry.stream_url) return;
    if (playingId === entry.id) {
      a.pause();
      setPlayingId(null);
    } else {
      a.src = entry.stream_url;
      a.play().catch(() => {});
      setPlayingId(entry.id);
    }
  }, [playingId]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnd = () => setPlayingId(null);
    a.addEventListener("ended", onEnd);
    return () => a.removeEventListener("ended", onEnd);
  }, []);

  // ── Enter contest ──
  const enterContest = useCallback(async (trackId: string) => {
    if (!selectedContest) return;
    setEnteringTrackId(trackId);
    try {
      const token = localStorage.getItem("soluna-token");
      await fetch(`/api/v1/contests/${selectedContest.id}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ track_id: trackId }),
      });
      // Refresh entries
      selectContest(selectedContest);
    } catch { /* silently fail */ }
    setEnteringTrackId(null);
  }, [selectedContest, selectContest]);

  // ── Fetch user tracks when enter section opens ──
  useEffect(() => {
    if (!showEnterSection || !isLoggedIn) return;
    const token = localStorage.getItem("soluna-token");
    fetch("/api/v1/artist/tracks", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((d) => setUserTracks(d.tracks || []))
      .catch(() => {});
  }, [showEnterSection, isLoggedIn]);

  // ── Helpers ──
  const maxVotes = Math.max(1, ...entries.map((e) => e.votes));
  const totalVotes = entries.reduce((s, e) => s + e.votes, 0) || 1;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#05060a", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <audio ref={audioRef} preload="auto" />

      {/* ── Header ── */}
      <GlobalNav lang={lang} onToggleLang={toggleLang} />

      {/* ── Hero ── */}
      {!selectedContest && (
        <section style={{
          padding: "80px 24px 48px", textAlign: "center",
          background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,98,0.08) 0%, transparent 60%)",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: gold, marginBottom: 16, textTransform: "uppercase" }}>
            {t("投票 & コンテスト", "Vote & Contests")}
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, margin: "0 0 16px", letterSpacing: -1, lineHeight: 1.2 }}>
            SOLUNA FEST 2026
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto 8px", fontSize: 15, lineHeight: 1.7 }}>
            {t(
              "オープニングアクトをあなたの投票で決めよう。お気に入りのアーティストに投票して、フェスの舞台を作ろう。",
              "Vote for the Opening Act. Your vote shapes the festival stage. Support your favorite artists and help them perform live."
            )}
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24,
            padding: "10px 24px", borderRadius: 32, background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.15)",
          }}>
            <span style={{ fontSize: 18 }}>&#9734;</span>
            <span style={{ fontSize: 13, color: gold, fontWeight: 600 }}>Opening Act Contest</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>|</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t("開催中", "Live Now")}</span>
          </div>
        </section>
      )}

      {/* ── Contest List ── */}
      {!selectedContest && (
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              <div style={{ animation: "soluna-pulse 1.5s infinite" }}>{t("読み込み中...", "Loading...")}</div>
            </div>
          ) : contests.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
              {t("現在コンテストはありません", "No contests available")}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {contests.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectContest(c)}
                  style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: "24px 28px", cursor: "pointer", textAlign: "left",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "all 0.2s", color: "#fff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(201,169,98,0.06)";
                    e.currentTarget.style.borderColor = "rgba(201,169,98,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                    {c.description && (
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{c.description}</div>
                    )}
                    <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                      {c.entry_count != null && (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                          {c.entry_count} {t("エントリー", "entries")}
                        </span>
                      )}
                      {c.total_votes != null && (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                          {c.total_votes.toLocaleString()} {t("投票", "votes")}
                        </span>
                      )}
                      {c.deadline && (
                        <span style={{ fontSize: 11, color: "rgba(201,169,98,0.6)" }}>
                          {t("締切", "Deadline")}: {new Date(c.deadline).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, color: "rgba(255,255,255,0.15)", flexShrink: 0, marginLeft: 16 }}>&#8250;</div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Selected Contest Detail ── */}
      {selectedContest && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
          {/* Back + title */}
          <div style={{ padding: "32px 0 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => { setSelectedContest(null); setEntries([]); setPlayingId(null); audioRef.current?.pause(); }}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "rgba(255,255,255,0.5)",
                fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              &#8249;
            </button>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedContest.title}</h2>
              {selectedContest.description && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>{selectedContest.description}</p>
              )}
            </div>
          </div>

          {entriesLoading ? (
            <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              <div style={{ animation: "soluna-pulse 1.5s infinite" }}>{t("読み込み中...", "Loading entries...")}</div>
            </div>
          ) : (
            <>
              {/* ── Leaderboard ── */}
              {entries.length > 0 && (
                <section style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 20, padding: "28px 28px 20px", marginBottom: 24,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: gold, marginBottom: 20, textTransform: "uppercase" }}>
                    {t("リーダーボード", "Leaderboard")}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {entries.slice(0, 10).map((entry, i) => {
                      const pct = (entry.votes / maxVotes) * 100;
                      const votePct = ((entry.votes / totalVotes) * 100).toFixed(1);
                      return (
                        <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{
                            width: 28, fontSize: i < 3 ? 15 : 12, fontWeight: 700, textAlign: "center",
                            color: i === 0 ? gold : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "rgba(255,255,255,0.25)",
                          }}>
                            {i + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {entry.title}
                                <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: 8 }}>{entry.artist}</span>
                              </span>
                              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", flexShrink: 0, marginLeft: 8 }}>
                                {entry.votes.toLocaleString()} ({votePct}%)
                              </span>
                            </div>
                            <div style={{
                              height: 6, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden",
                            }}>
                              <div
                                style={{
                                  height: "100%", borderRadius: 3,
                                  background: i === 0
                                    ? `linear-gradient(90deg, ${gold}, #e8d48b)`
                                    : `linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.2))`,
                                  width: `${pct}%`,
                                  "--bar-w": `${pct}%`,
                                  animation: "soluna-bar-grow 0.8s ease-out forwards",
                                  animationDelay: `${i * 0.05}s`,
                                } as React.CSSProperties}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── Entries grid ── */}
              {entries.length > 0 && (
                <section>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", marginBottom: 16, textTransform: "uppercase" }}>
                    {t("エントリー一覧", "All Entries")} ({entries.length})
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {entries.map((entry) => {
                      const isPlaying = playingId === entry.id;
                      const hasVoted = votedIds.has(entry.id);
                      const isAnimating = voteAnimId === entry.id;
                      return (
                        <div
                          key={entry.id}
                          style={{
                            background: isPlaying ? "rgba(201,169,98,0.04)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isPlaying ? "rgba(201,169,98,0.12)" : "rgba(255,255,255,0.06)"}`,
                            borderRadius: 16, padding: 20, transition: "all 0.3s",
                          }}
                        >
                          {/* Cover + info */}
                          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                            {/* Cover art */}
                            <div style={{
                              width: 64, height: 64, borderRadius: 12, flexShrink: 0, overflow: "hidden",
                              background: "linear-gradient(135deg, rgba(201,169,98,0.15), rgba(201,169,98,0.05))",
                              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                            }}>
                              {entry.cover_url ? (
                                <img src={entry.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <span style={{ fontSize: 24, opacity: 0.3 }}>&#9835;</span>
                              )}
                              {isPlaying && (
                                <div style={{
                                  position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  <EqBars playing />
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {entry.title}
                              </div>
                              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {entry.artist}
                              </div>
                              {/* Vote count */}
                              <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.04)",
                                animation: isAnimating ? "soluna-vote-pop 0.5s ease" : "none",
                              }}>
                                <span style={{ fontSize: 12 }}>&#9829;</span>
                                <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: hasVoted ? gold : "#fff" }}>
                                  {entry.votes.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Vote progress bar */}
                          <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.04)", marginBottom: 14 }}>
                            <div style={{
                              height: "100%", borderRadius: 2,
                              background: `linear-gradient(90deg, ${gold}80, ${gold})`,
                              width: `${(entry.votes / maxVotes) * 100}%`,
                              transition: "width 0.5s ease",
                            }} />
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: "flex", gap: 8 }}>
                            {/* Play button */}
                            <button
                              onClick={() => togglePlay(entry)}
                              disabled={!entry.stream_url}
                              style={{
                                flex: 1, padding: "10px 0", borderRadius: 10, cursor: entry.stream_url ? "pointer" : "not-allowed",
                                background: isPlaying ? "rgba(201,169,98,0.12)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${isPlaying ? "rgba(201,169,98,0.2)" : "rgba(255,255,255,0.06)"}`,
                                color: isPlaying ? gold : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                opacity: entry.stream_url ? 1 : 0.3, transition: "all 0.2s",
                              }}
                            >
                              <span style={{ fontSize: 14 }}>{isPlaying ? "\u23F8" : "\u25B6"}</span>
                              {isPlaying ? t("停止", "Pause") : t("再生", "Play")}
                            </button>

                            {/* Vote button */}
                            <button
                              onClick={() => vote(entry.id)}
                              disabled={hasVoted}
                              style={{
                                flex: 1, padding: "10px 0", borderRadius: 10, cursor: hasVoted ? "default" : "pointer",
                                background: hasVoted
                                  ? "rgba(201,169,98,0.1)"
                                  : `linear-gradient(135deg, ${gold}, #b8953a)`,
                                border: "1px solid transparent",
                                color: hasVoted ? gold : "#05060a",
                                fontSize: 12, fontWeight: 600,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                transition: "all 0.2s",
                              }}
                            >
                              <span style={{ fontSize: 14 }}>{hasVoted ? "\u2713" : "\u2661"}</span>
                              {hasVoted ? t("投票済み", "Voted") : t("投票する", "Vote")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {entries.length === 0 && !entriesLoading && (
                <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  {t("まだエントリーがありません", "No entries yet")}
                </div>
              )}

              {/* ── Enter Contest Section ── */}
              <section style={{
                marginTop: 32, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 20, padding: "28px 28px 24px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 4, color: gold, marginBottom: 6, textTransform: "uppercase" }}>
                      {t("コンテストに参加", "Enter Contest")}
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                      {t("あなたの楽曲をエントリーして、フェスのステージを目指そう", "Submit your track for a chance to perform live")}
                    </p>
                  </div>
                  {isLoggedIn && (
                    <button
                      onClick={() => setShowEnterSection(!showEnterSection)}
                      style={{
                        background: showEnterSection ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${gold}, #b8953a)`,
                        border: "1px solid transparent", borderRadius: 10, padding: "10px 20px",
                        color: showEnterSection ? "rgba(255,255,255,0.5)" : "#05060a",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      {showEnterSection ? t("閉じる", "Close") : t("楽曲を選択", "Select Track")}
                    </button>
                  )}
                </div>

                {!isLoggedIn && (
                  <a
                    href="/artist"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px",
                      borderRadius: 10, background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.15)",
                      color: gold, textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "all 0.2s",
                    }}
                  >
                    {t("アーティストポータルにログイン", "Log in to Artist Portal")} &#8250;
                  </a>
                )}

                {showEnterSection && isLoggedIn && (
                  <div style={{ marginTop: 16 }}>
                    {userTracks.length === 0 ? (
                      <div style={{ padding: "24px 0", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                        {t("アップロード済みの楽曲がありません。", "No uploaded tracks found.")}
                        {" "}
                        <a href="/artist" style={{ color: gold, textDecoration: "none" }}>
                          {t("楽曲をアップロード", "Upload tracks")} &#8250;
                        </a>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {userTracks.map((track) => (
                          <div
                            key={track.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                              borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            <div style={{
                              width: 40, height: 40, borderRadius: 8, flexShrink: 0, overflow: "hidden",
                              background: "linear-gradient(135deg, rgba(201,169,98,0.12), rgba(201,169,98,0.04))",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {track.cover_url ? (
                                <img src={track.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <span style={{ fontSize: 16, opacity: 0.25 }}>&#9835;</span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {track.title}
                              </div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{track.artist}</div>
                            </div>
                            <button
                              onClick={() => enterContest(track.id)}
                              disabled={enteringTrackId === track.id}
                              style={{
                                padding: "7px 16px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                background: enteringTrackId === track.id ? "rgba(255,255,255,0.04)" : "rgba(201,169,98,0.1)",
                                border: "1px solid rgba(201,169,98,0.15)", color: gold, transition: "all 0.2s",
                              }}
                            >
                              {enteringTrackId === track.id ? t("送信中...", "Submitting...") : t("エントリー", "Enter")}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={{
        padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)",
        color: "rgba(255,255,255,0.2)", fontSize: 11,
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 12 }}>
          <a href="/artist" style={{ color: gold, textDecoration: "none", fontSize: 11 }}>{t("アーティストポータル", "Artist Portal")}</a>
          <a href="/music" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 11 }}>{t("ラジオ", "Radio")}</a>
          <a href="/tickets" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 11 }}>{t("チケット", "Tickets")}</a>
        </div>
        SOLUNA FEST 2026
      </footer>
    </div>
  );
}
