"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import GlobalNav from "@/components/GlobalNav";

let _lang = "en";
const t = (ja: string, en: string, lang?: string) => ((lang || _lang) === "ja" ? ja : en);

interface Track {
  id: string;
  title: string;
  artist: string;
  duration_sec: number | null;
  format: string;
  genre: string;
  play_count: number;
  rights_status: string | null;
  isrc: string | null;
  stream_url: string;
}

export default function MusicPage() {
  const [lang, setLang] = useState("en");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(true);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const s = localStorage.getItem("soluna-lang");
    if (s) setLang(s);
    else if (navigator.language.startsWith("ja")) setLang("ja");
  }, []);
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); _lang = n; localStorage.setItem("soluna-lang", n); };
  _lang = lang;

  // Fetch tracks
  useEffect(() => {
    fetch("/api/v1/explore/tracks")
      .then((r) => r.json())
      .then((d) => {
        const unique = (d.tracks || []).filter(
          (t: Track, i: number, arr: Track[]) => arr.findIndex((x: Track) => x.title === t.title && x.artist === t.artist) === i
        );
        setTracks(unique);
        const shuffled = [...unique].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
        setLoading(false);
      });
  }, []);

  // Audio events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => { setCurrentTime(a.currentTime); setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0); };
    const onMeta = () => setDuration(a.duration);
    const onEnd = () => nextTrack();
    const onError = () => nextTrack();
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onError);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("ended", onEnd); a.removeEventListener("error", onError); };
  });

  const playIndex = useCallback((idx: number) => {
    const a = audioRef.current;
    if (!a || idx < 0 || idx >= queue.length) return;
    setCurrentIndex(idx);
    a.src = queue[idx].stream_url;
    a.volume = volume;
    a.play().catch(() => {});
    setIsPlaying(true);
  }, [queue, volume]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (currentIndex === -1 && queue.length > 0) { playIndex(0); return; }
    if (isPlaying) { a.pause(); setIsPlaying(false); } else { a.play(); setIsPlaying(true); }
  };

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const next = currentIndex + 1 >= queue.length ? 0 : currentIndex + 1;
    playIndex(next);
  }, [currentIndex, queue, playIndex]);

  const prevTrack = () => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) { a.currentTime = 0; return; }
    const prev = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    playIndex(prev);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = ((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width) * a.duration;
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
    if (!shuffle) {
      const current = queue[currentIndex];
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      if (current) setCurrentIndex(shuffled.findIndex((t) => t.id === current.id));
    } else {
      const current = queue[currentIndex];
      setQueue([...tracks]);
      if (current) setCurrentIndex(tracks.findIndex((t) => t.id === current.id));
    }
  };

  const selectTrack = (track: Track) => {
    const idx = queue.findIndex((t) => t.id === track.id);
    if (idx >= 0) playIndex(idx);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  const current = currentIndex >= 0 ? queue[currentIndex] : null;

  const gold = "#C9A962";

  const genreColors: Record<string, string> = {
    "afro-house": "#f59e0b",
    "chill": "#06b6d4",
    "electronic": "#8b5cf6",
    "hip-hop": "#ef4444",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050608", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <audio ref={audioRef} preload="auto" />

      {/* Header */}
      <GlobalNav lang={lang} onToggleLang={toggleLang} />

      <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 52px - 96px)" }}>
        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 24px" }}>

          {/* Now playing visualizer */}
          <div style={{
            width: "min(340px, 80vw)", aspectRatio: "1", borderRadius: 24,
            background: current
              ? `linear-gradient(135deg, ${genreColors[current.genre] || "#8b5cf6"}15 0%, #0a0d1480 50%, ${genreColors[current.genre] || "#8b5cf6"}08 100%)`
              : "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            border: `1px solid ${current ? `${genreColors[current.genre] || gold}20` : "rgba(255,255,255,0.04)"}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            marginBottom: 32, position: "relative", overflow: "hidden",
            boxShadow: current ? `0 40px 100px ${genreColors[current.genre] || gold}10` : "none",
            transition: "all 0.5s ease",
          }}>
            {/* Animated rings */}
            {isPlaying && [0, 1, 2].map((i) => (
              <div key={i} style={{
                position: "absolute", borderRadius: "50%",
                border: `1px solid ${genreColors[current?.genre || ""] || gold}${15 - i * 4}`,
                width: `${60 + i * 30}%`, height: `${60 + i * 30}%`,
                animation: `spin ${8 + i * 4}s linear infinite${i % 2 ? " reverse" : ""}`,
              }} />
            ))}
            <div style={{ zIndex: 1, textAlign: "center", padding: 24 }}>
              {current ? (
                <>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1.2, marginBottom: 8 }}>{current.title}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>{current.artist}</div>
                  {current.genre && (
                    <div style={{ marginTop: 12, display: "inline-block", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", background: `${genreColors[current.genre] || gold}20`, color: genreColors[current.genre] || gold, padding: "3px 10px", borderRadius: 20 }}>
                      {current.genre}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32, fontWeight: 800, color: gold, letterSpacing: -1 }}>SOLUNA</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8, letterSpacing: 2 }}>
                    {loading ? t("読み込み中...", "Loading...") : t("再生ボタンを押してください", "Press play to start")}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: "min(400px, 90vw)", marginBottom: 20 }}>
            <div onClick={seek} style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, cursor: "pointer", marginBottom: 6 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${genreColors[current?.genre || ""] || gold}, ${genreColors[current?.genre || ""] || gold}aa)`, borderRadius: 2, transition: "width 0.2s linear" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
            <button onClick={toggleShuffle} title={shuffle ? "Shuffle ON" : "Shuffle OFF"} style={{ background: "none", border: "none", cursor: "pointer", color: shuffle ? gold : "rgba(255,255,255,0.2)", padding: 4 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h5l3.5 7L9 18H4m16-14h-5l-3.5 7L15 18h5M16 4l4 3.5L16 11m4 3l-4 3.5L20 21" /></svg>
            </button>
            <button onClick={prevTrack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: 4 }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>
            <button onClick={togglePlay} style={{
              width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${gold}, #a88b3d)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 24px ${gold}40`,
            }}>
              {isPlaying
                ? <svg width="22" height="22" fill="#000" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                : <svg width="22" height="22" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
            </button>
            <button onClick={nextTrack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: 4 }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolume}
                style={{ width: 60, accentColor: gold, height: 3 }} />
            </div>
          </div>
        </div>

        {/* Track list */}
        <div style={{ maxWidth: 640, width: "100%", margin: "0 auto", padding: "0 16px 120px" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.15)", marginBottom: 10, textTransform: "uppercase", paddingLeft: 4 }}>
            {t(`${queue.length} トラック`, `${queue.length} Tracks`)} {shuffle && `· ${t("シャッフル", "Shuffle")}`}
          </div>
          {queue.map((track, i) => {
            const isActive = currentIndex === i;
            const isTrackPlaying = isActive && isPlaying;
            const gc = genreColors[track.genre] || "rgba(255,255,255,0.3)";
            return (
              <button key={`${track.id}-${i}`} onClick={() => selectTrack(track)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                background: isActive ? `${gc}08` : "transparent",
                border: "none", borderRadius: 10, cursor: "pointer", textAlign: "left", color: "#fff",
                borderLeft: isActive ? `2px solid ${gc}` : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                {/* Number / Equalizer */}
                <div style={{ width: 28, textAlign: "center", flexShrink: 0 }}>
                  {isTrackPlaying ? (
                    <div style={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "flex-end", height: 14 }}>
                      {[0, 1, 2].map((b) => (
                        <div key={b} style={{ width: 3, borderRadius: 1, background: gc, animation: `eq ${0.4 + b * 0.15}s ease-in-out infinite alternate`, height: `${6 + b * 3}px` }} />
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: isActive ? gc : "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>{i + 1}</span>
                  )}
                </div>
                {/* Track info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? gc : "rgba(255,255,255,0.75)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{track.artist}</div>
                </div>
                {/* Genre tag */}
                {track.genre && (
                  <span style={{ fontSize: 8, letterSpacing: 1, textTransform: "uppercase", color: `${gc}90`, background: `${gc}10`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                    {track.genre}
                  </span>
                )}
                {/* Rights status badge */}
                {track.rights_status === "confirmed" && (
                  <span title={track.isrc || ""} style={{ fontSize: 8, letterSpacing: 0.5, color: "#4ade80", background: "rgba(74,222,128,0.08)", padding: "2px 6px", borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="#4ade80"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t("権利確認済", "RIGHTS")}
                  </span>
                )}
                {(track.rights_status === "pending_confirmation" || track.rights_status === "draft") && (
                  <span style={{ fontSize: 8, letterSpacing: 0.5, color: "rgba(255,255,255,0.2)", padding: "2px 5px", borderRadius: 4, flexShrink: 0 }}>
                    {t("未登録", "NO RIGHTS")}
                  </span>
                )}
                {/* Play count */}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", fontFamily: "monospace", flexShrink: 0, minWidth: 24, textAlign: "right" }}>
                  {track.play_count > 0 ? `${track.play_count}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom player (mobile-friendly) */}
      {current && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: "rgba(10,13,20,0.95)", backdropFilter: "blur(20px)",
          borderTop: `1px solid ${genreColors[current.genre] || gold}15`,
          padding: "8px 16px", display: "none",
        }}>
          {/* This is hidden on desktop, shown on mobile via CSS if needed */}
        </div>
      )}

      {/* Info section */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14, padding: "20px 22px" }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t("SOLUNA Music Platform", "SOLUNA Music Platform")}</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, margin: "0 0 12px" }}>
            {t(
              "全トラックは権利者に自動でロイヤリティが分配されます。再生ごとに¥0.5が権利者の残高に加算されます。",
              "All tracks automatically distribute royalties to rights holders. Each stream adds ¥0.5 to the rights holder's balance."
            )}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/rights" style={{ fontSize: 11, color: gold, textDecoration: "none" }}>{t("権利管理について →", "About Rights →")}</a>
            <a href="/developers" style={{ fontSize: 11, color: gold, textDecoration: "none" }}>{t("API ドキュメント →", "API Docs →")}</a>
            <a href="/tickets" style={{ fontSize: 11, color: gold, textDecoration: "none" }}>{t("チケット購入 →", "Buy Tickets →")}</a>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes eq { from { height: 4px; } to { height: 14px; } }
        input[type="range"] { -webkit-appearance: none; background: rgba(255,255,255,0.08); border-radius: 2px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; background: ${gold}; cursor: pointer; }
      `}</style>
    </div>
  );
}
