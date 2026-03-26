"use client";

import { useState, useEffect, useRef, useCallback } from "react";

let _lang = "en";
const t = (ja: string, en: string) => _lang === "ja" ? ja : en;
const gold = "#C9A962";

interface TrackMeta {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  album?: string;
  release_year?: number;
  label?: string;
  cover_url?: string;
  isrc?: string;
  audio_hash?: string;
  anchor_tx?: string;
  rights_status?: string;
  bpm?: number;
  play_count?: number;
  created_at?: string;
}

type StageStatus = "analyzing" | "ready" | "uploading" | "done" | "error" | "duplicate";

interface StagingItem {
  uid: string;
  file: File;
  title: string;
  artist: string;
  genre: string;
  album: string;
  coverUrl: string;   // iTunes or canvas-generated
  lyricsPreview: string;
  status: StageStatus;
  progress: number;
  track?: TrackMeta;
  duplicateId?: string;
  duplicateTrack?: TrackMeta;
  error?: string;
}

// ── Client-side canvas cover generator ─────────────────────────────────────
function generateCoverDataUrl(title: string, artist: string, genre: string): string {
  if (typeof window === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 400;
  const ctx = canvas.getContext("2d")!;
  const palettes: Record<string, [string, string]> = {
    "J-Pop": ["#FF6B9D", "#C44569"], "Electronic": ["#6C63FF", "#3F3D56"],
    "Hip-Hop/Rap": ["#F7971E", "#FFD200"], "Rock": ["#ED213A", "#93291E"],
    "Jazz": ["#2193b0", "#6dd5ed"], "R&B": ["#f953c6", "#b91d73"],
    "Classical": ["#834d9b", "#d04ed6"], "Pop": ["#FF9A9E", "#a18cd1"],
    "Worldwide": ["#43cea2", "#185a9d"], "Soundtrack": ["#434343", "#111"],
    "default": ["#C9A962", "#3a2c1a"],
  };
  const [c1, c2] = palettes[genre] ?? palettes["default"];
  let h = 0;
  for (const c of (title + artist).toLowerCase()) h = Math.imul(31, h) + c.charCodeAt(0) | 0;
  h = Math.abs(h);

  const grad = ctx.createLinearGradient(0, 0, 400, 400);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 400, 400);

  ctx.globalAlpha = 0.1; ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(150 + (h % 80) - 40, 150 + ((h >> 8) % 60) - 30, 100 + (h % 60), 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(280 + ((h >> 4) % 60) - 30, 220, 70 + ((h >> 2) % 40), 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "bold 11px Arial";
  ctx.fillText("SOLUNA", 24, 46);
  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "17px Arial";
  ctx.fillText((artist || "").toUpperCase().slice(0, 22), 24, 326);
  ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.font = "bold 26px Arial";
  ctx.fillText(title.slice(0, 20) + (title.length > 20 ? "…" : ""), 24, 364);

  return canvas.toDataURL("image/jpeg", 0.85);
}

// ── iTunes metadata prefetch ────────────────────────────────────────────────
async function fetchItunesMeta(artist: string, title: string) {
  try {
    const q = encodeURIComponent(`${artist} ${title}`);
    const r = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=5`);
    if (!r.ok) return null;
    const d = await r.json();
    const results: any[] = d.results || [];
    const lTitle = title.toLowerCase(), lArtist = artist.toLowerCase();
    const match = results.find(x =>
      (x.trackName?.toLowerCase() || "").includes(lTitle) ||
      lTitle.includes((x.trackName?.toLowerCase() || ""))
    ) || results.find(x =>
      (x.artistName?.toLowerCase() || "").includes(lArtist.split(" ")[0])
    ) || results[0];
    if (!match) return null;
    return {
      cover: match.artworkUrl100?.replace("100x100bb", "600x600bb"),
      album: match.collectionName as string,
      release_year: match.releaseDate ? new Date(match.releaseDate).getFullYear() : null,
      genre: match.primaryGenreName as string,
    };
  } catch { return null; }
}

// ── Lyrics preview (first 3 lines) ─────────────────────────────────────────
async function fetchLyricsPreview(artist: string, title: string): Promise<string> {
  try {
    const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    if (!r.ok) return "";
    const d = await r.json();
    return (d.lyrics || "").split("\n").filter((l: string) => l.trim()).slice(0, 3).join("\n");
  } catch { return ""; }
}

// ── Parse filename into title ───────────────────────────────────────────────
function parseFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

interface FeaturedTrack {
  id: string; title: string; artist: string; genre?: string;
  cover_url?: string; play_count?: number; stream_url?: string;
}
interface FeaturedChannel {
  slug: string; name: string; creator: string; track_count: number;
}

export default function ArtistPage() {
  const [lang, setLang] = useState("en");
  const [featuredTracks, setFeaturedTracks] = useState<FeaturedTrack[]>([]);
  const [featuredChannels, setFeaturedChannels] = useState<FeaturedChannel[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("/api/v1/explore/tracks?limit=6").then(r => r.json()).then(d => setFeaturedTracks(d.tracks || [])).catch(() => {});
    fetch("/api/v1/explore/radios?limit=4").then(r => r.json()).then(d => setFeaturedChannels(d.radios || [])).catch(() => {});
  }, []);

  const previewTrack = (track: FeaturedTrack) => {
    const a = previewAudioRef.current; if (!a) return;
    if (previewId === track.id) { a.pause(); setPreviewId(null); }
    else { a.src = track.stream_url || `/api/v1/tracks/${track.id}/stream`; a.play().catch(()=>{}); setPreviewId(track.id); }
  };
  useEffect(() => {
    const s = localStorage.getItem("soluna-lang");
    if (s) setLang(s);
    else if (navigator.language.startsWith("ja")) setLang("ja");
  }, []);
  const toggleLang = () => {
    const n = lang === "ja" ? "en" : "ja";
    setLang(n); _lang = n; localStorage.setItem("soluna-lang", n);
  };
  _lang = lang;

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; plan: string; name: string } | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [tracks, setTracks] = useState<TrackMeta[]>([]);
  const [items, setItems] = useState<StagingItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [radioSlug, setRadioSlug] = useState<string | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("soluna-token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/v1/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.user) { setUser(d.user); loadTracks(); }
        else { setToken(null); localStorage.removeItem("soluna-token"); }
      });
  }, [token]); // eslint-disable-line

  const loadTracks = useCallback(async () => {
    if (!token) return;
    const d = await fetch("/api/v1/tracks", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const list: TrackMeta[] = d.tracks || [];
    setTracks(list);

    if (list.length > 0) {
      const radios = await fetch("/api/v1/radios", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      if (radios.radios?.length > 0) setRadioSlug(radios.radios[0].slug);
    }
  }, [token]);

  const handleAuth = async () => {
    if (!authEmail || !authPassword) return;
    setAuthLoading(true); setAuthMsg("");
    try {
      const body: Record<string, string> = { email: authEmail, password: authPassword };
      if (authMode === "register") body.name = authName;
      const url = authMode === "register" ? "/api/v1/auth/register" : "/api/v1/auth/login";
      const d = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
      if (d.ok && (d.api_key || d.token)) {
        const key = d.api_key || d.token;
        setToken(key); localStorage.setItem("soluna-token", key);
      } else setAuthMsg(d.error || t("失敗しました", "Failed"));
    } catch { setAuthMsg(t("エラーが発生しました", "Error")); }
    setAuthLoading(false);
  };

  // ── Stage files: analyze metadata then upload ─────────────────────────────
  const stageFiles = useCallback(async (files: File[]) => {
    if (!token || !user) return;
    const audioFiles = files.filter(f =>
      f.type.startsWith("audio/") || /\.(mp3|wav|m4a|ogg|flac|aac)$/i.test(f.name)
    );
    if (audioFiles.length === 0) return;

    const artistName = user.name || user.email.split("@")[0];

    // Create staging items immediately
    const newItems: StagingItem[] = audioFiles.map(f => ({
      uid: crypto.randomUUID(),
      file: f,
      title: parseFilename(f.name),
      artist: artistName,
      genre: "",
      album: "",
      coverUrl: "",
      lyricsPreview: "",
      status: "analyzing" as StageStatus,
      progress: 0,
    }));
    setItems(prev => [...newItems, ...prev]);

    // Analyze and upload each file
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      const uid = item.uid;

      // Parallel: canvas cover + iTunes metadata
      const canvasCover = generateCoverDataUrl(item.title, item.artist, "");
      setItems(prev => prev.map(x => x.uid === uid ? { ...x, coverUrl: canvasCover } : x));

      // iTunes + lyrics in parallel (with 3s timeout)
      const [itunes, lyrics] = await Promise.all([
        Promise.race([fetchItunesMeta(item.artist, item.title), new Promise<null>(r => setTimeout(() => r(null), 3000))]),
        Promise.race([fetchLyricsPreview(item.artist, item.title), new Promise<string>(r => setTimeout(() => r(""), 3000))]),
      ]);

      const genre = (itunes as any)?.genre || "";
      const album = (itunes as any)?.album || "";
      const release_year = (itunes as any)?.release_year || null;
      const cover = (itunes as any)?.cover || canvasCover;

      // Update with fetched metadata
      setItems(prev => prev.map(x => x.uid === uid ? {
        ...x, genre, album, coverUrl: cover,
        lyricsPreview: (lyrics as string) || "",
        status: "ready" as StageStatus,
      } : x));

      // Upload immediately
      setItems(prev => prev.map(x => x.uid === uid ? { ...x, status: "uploading", progress: 20 } : x));

      const form = new FormData();
      form.append("file", item.file);
      form.append("title", item.title);
      form.append("artist", item.artist);
      form.append("auto_rights", "true");
      form.append("attested", "true");
      form.append("public", "1");
      if (genre) form.append("genre", genre);
      if (album) form.append("album", album);
      if (release_year) form.append("release_year", String(release_year));
      // Pass iTunes cover URL if it's a real URL (not data:)
      if (cover && !cover.startsWith("data:")) form.append("cover_url", cover);

      try {
        const r = await fetch("/api/v1/tracks", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const d = await r.json();

        if (d.ok) {
          setItems(prev => prev.map(x => x.uid === uid ? {
            ...x, status: "done", progress: 100, track: d.track,
          } : x));
          // Auto-add to radio channel
          await ensureRadioAndAdd(d.track.id);
          await loadTracks();
          // Poll for enriched metadata (cover, genre) — enrichment is async on server
          pollMetadata(d.track.id, uid);
        } else if (r.status === 409) {
          setItems(prev => prev.map(x => x.uid === uid ? {
            ...x, status: "duplicate", progress: 100,
            duplicateId: d.duplicate_track_id,
            duplicateTrack: d.duplicate_track,
            error: d.error,
          } : x));
        } else {
          setItems(prev => prev.map(x => x.uid === uid ? {
            ...x, status: "error", error: d.error || t("アップロード失敗", "Upload failed"), progress: 0,
          } : x));
        }
      } catch {
        setItems(prev => prev.map(x => x.uid === uid ? {
          ...x, status: "error", error: t("ネットワークエラー", "Network error"), progress: 0,
        } : x));
      }
    }
  }, [token, user, loadTracks]); // eslint-disable-line

  const ensureRadioAndAdd = useCallback(async (trackId: string) => {
    if (!token || !user) return;
    const slug = (user.name || user.email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]/g, "-");
    let radios = await fetch("/api/v1/radios", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    let radio = radios.radios?.[0];
    if (!radio) {
      const r = await fetch("/api/v1/radios", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name || "My Channel", slug, description: "Music channel on SOLUNA", public: true }),
      }).then(r => r.json());
      radio = r.radio;
    }
    if (radio) {
      setRadioSlug(radio.slug);
      await fetch(`/api/v1/radios/${radio.id}/tracks`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ track_id: trackId }),
      });
    }
  }, [token, user]);

  // ── Poll for enriched metadata after upload ───────────────────────────────
  const pollMetadata = useCallback((trackId: string, uid: string) => {
    let attempts = 0;
    const poll = async () => {
      if (attempts++ >= 8) return;
      await new Promise(r => setTimeout(r, 3000));
      try {
        const d = await fetch(`/api/v1/tracks/${trackId}/proof`).then(r => r.json());
        const m = d.metadata || {};
        if (m.cover_url || m.genre) {
          setItems(prev => prev.map(x => x.uid === uid && x.track ? {
            ...x, coverUrl: m.cover_url || x.coverUrl,
            track: { ...x.track, cover_url: m.cover_url || x.track?.cover_url, genre: m.genre || x.track?.genre },
          } : x));
          setTracks(prev => prev.map(t => t.id === trackId ? {
            ...t, cover_url: m.cover_url || t.cover_url, genre: m.genre || t.genre,
            album: m.album || t.album, release_year: m.release_year || t.release_year,
          } : t));
          if (m.cover_url) return; // Got cover, stop polling
        }
        poll();
      } catch { poll(); }
    };
    poll();
  }, []);

  // ── Copy channel URL ──────────────────────────────────────────────────────
  const copyChannelUrl = useCallback(() => {
    if (!radioSlug) return;
    const url = `${window.location.origin}/radio/${radioSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [radioSlug]);

  // ── Inline metadata edit + save ───────────────────────────────────────────
  const saveTrackMeta = useCallback(async (trackId: string, updates: Partial<TrackMeta>) => {
    await fetch(`/api/v1/tracks/${trackId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, ...updates } : t));
  }, [token]);

  // ── Generate cover art (AI via server, falls back to SVG) ────────────────
  const generateCover = useCallback(async (track: TrackMeta) => {
    // Optimistically show SVG immediately
    const svgUrl = `/api/v1/tracks/${track.id}/cover`;
    setTracks(prev => prev.map(t => t.id === track.id ? { ...t, cover_url: svgUrl } : t));
    try {
      const d = await fetch(`/api/v1/tracks/${track.id}/cover/generate`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      if (d.ok) setTracks(prev => prev.map(t => t.id === track.id ? { ...t, cover_url: d.cover_url } : t));
    } catch {}
  }, [token]);

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); stageFiles(Array.from(e.dataTransfer.files)); };
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) stageFiles(Array.from(e.target.files)); };

  const playTrack = (trackId: string) => {
    const a = audioRef.current; if (!a) return;
    if (currentTrackId === trackId && isPlaying) { a.pause(); setIsPlaying(false); }
    else { setCurrentTrackId(trackId); a.src = `/api/v1/tracks/${trackId}/stream`; a.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  const logout = () => { setToken(null); setUser(null); localStorage.removeItem("soluna-token"); };

  const inp: React.CSSProperties = {
    padding: "10px 13px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05060a", color: "#fff", fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <header style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <a href="/" style={{ color: gold, textDecoration: "none", fontSize: 13, letterSpacing: 5, fontWeight: 700 }}>SOLUNA</a>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user && <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>{user.name || user.email}</span>}
          {radioSlug && (
            <>
              <a href={`/artists/${radioSlug}`} target="_blank" style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,.08)" }}>
                {t("プロフィール", "Profile")}
              </a>
              <a href={`/radio/${radioSlug}`} target="_blank" style={{ fontSize: 11, color: gold, textDecoration: "none", background: "rgba(201,169,98,0.1)", padding: "4px 12px", borderRadius: 20, border: `1px solid rgba(201,169,98,0.2)` }}>
                ▶ {t("チャンネル", "Channel")}
              </a>
            </>
          )}
          {user && <button onClick={logout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.07)", color: "rgba(255,255,255,.3)", fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}>{t("ログアウト", "Logout")}</button>}
          <button onClick={toggleLang} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,.4)", fontSize: 11, cursor: "pointer" }}>{lang === "ja" ? "EN" : "JP"}</button>
        </div>
      </header>

      {/* ══════════ LANDING PAGE (not logged in) ══════════ */}
      {!user && (
        <div style={{ overflowX: "hidden" }}>
          <audio ref={previewAudioRef} onEnded={() => setPreviewId(null)} />
          <style>{`
            @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
            @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
            @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
            @keyframes pulse-ring { 0%{transform:scale(.9);opacity:.7} 70%{transform:scale(1.15);opacity:0} 100%{transform:scale(.9);opacity:0} }
            @keyframes orb-drift { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(.95)} 100%{transform:translate(0,0) scale(1)} }
            @keyframes bar-dance { 0%,100%{height:6px} 50%{height:20px} }
            @keyframes glow-pulse { 0%,100%{opacity:.3;filter:blur(40px)} 50%{opacity:.7;filter:blur(60px)} }
            @keyframes slide-in-left { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
            @keyframes slide-in-right { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }

            .fade-up-1 { animation: fadeUp .7s .05s ease both; }
            .fade-up-2 { animation: fadeUp .7s .2s ease both; }
            .fade-up-3 { animation: fadeUp .7s .35s ease both; }
            .fade-up-4 { animation: fadeUp .7s .5s ease both; }
            .slide-left { animation: slide-in-left .7s .2s ease both; }
            .slide-right { animation: slide-in-right .7s .3s ease both; }

            .cta-primary { background: linear-gradient(135deg, #C9A962, #e8c97a, #a88b3d); background-size:200% auto; transition: background-position .3s, transform .15s, box-shadow .15s; }
            .cta-primary:hover { background-position: right center; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(201,169,98,.35); }
            .cta-ghost { transition: background .2s, color .2s, transform .15s; }
            .cta-ghost:hover { background: rgba(255,255,255,.08) !important; transform: translateY(-1px); }

            .track-row { transition: background .15s; }
            .track-row:hover { background: rgba(255,255,255,.06) !important; }
            .track-row:hover .play-overlay { opacity: 1 !important; }

            .feat-card { transition: transform .2s, border-color .2s, box-shadow .2s; }
            .feat-card:hover { transform: translateY(-4px); border-color: rgba(201,169,98,.3) !important; box-shadow: 0 16px 40px rgba(0,0,0,.4); }

            .ch-card { transition: transform .2s, border-color .2s; }
            .ch-card:hover { transform: translateY(-3px); border-color: rgba(201,169,98,.35) !important; }

            .note-float { animation: float 4s ease-in-out infinite; }

            .eq-bar { display:inline-block; width:3px; border-radius:2px; background:${gold}; animation: bar-dance .6s ease-in-out infinite; }
          `}</style>

          {/* ── HERO ─────────────────────────────────────────────── */}
          <div style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {/* Background image */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/hero_bg.jpg)", backgroundSize: "cover", backgroundPosition: "center 30%", filter: "brightness(.35) saturate(1.2)" }} />
            {/* Gradient overlays */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,6,10,.3) 0%, transparent 40%, rgba(5,6,10,.8) 85%, #05060a 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,169,98,.08) 0%, transparent 70%)" }} />
            {/* Animated orbs */}
            <div style={{ position: "absolute", top: "20%", left: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,98,.15) 0%, transparent 70%)", animation: "orb-drift 12s ease-in-out infinite", filter: "blur(30px)" }} />
            <div style={{ position: "absolute", top: "40%", right: "10%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,.12) 0%, transparent 70%)", animation: "orb-drift 16s ease-in-out infinite reverse", filter: "blur(40px)" }} />

            {/* Floating notes */}
            {["♪", "♫", "♩", "♬"].map((n, i) => (
              <div key={i} className="note-float" style={{ position: "absolute", fontSize: 24, color: `rgba(201,169,98,${0.1 + i * 0.05})`, top: `${20 + i * 15}%`, left: `${8 + i * 22}%`, animationDelay: `${i * 1.2}s`, userSelect: "none" }}>{n}</div>
            ))}

            {/* Hero content */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 840, padding: "0 24px" }}>
              <div className="fade-up-1" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, letterSpacing: 5, color: gold, border: `1px solid rgba(201,169,98,.3)`, borderRadius: 20, padding: "6px 18px", marginBottom: 32, backdropFilter: "blur(10px)", background: "rgba(0,0,0,.3)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", display: "inline-block", animation: "pulse-ring 2s ease-out infinite" }} />
                SOLUNA ARTIST PORTAL · BETA
              </div>

              <h1 className="fade-up-2" style={{ fontSize: "clamp(36px,7vw,76px)", fontWeight: 900, lineHeight: 1.08, margin: "0 0 24px", letterSpacing: -2 }}>
                {t("音楽を", "Your music,")}<br />
                <span style={{ background: "linear-gradient(120deg, #C9A962 0%, #f0d890 40%, #C9A962 80%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite", display: "inline-block" }}>
                  {t("世界に届ける", "heard worldwide.")}
                </span>
              </h1>

              <p className="fade-up-3" style={{ fontSize: "clamp(15px,2.2vw,20px)", color: "rgba(255,255,255,.5)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 40px" }}>
                {t(
                  "曲をドロップするだけで、権利登録・AIカバー生成・ラジオチャンネル開設がすべて自動。",
                  "Drop a track — rights protection, AI artwork, and your own radio channel go live in seconds."
                )}
              </p>

              <div className="fade-up-4" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
                <button onClick={() => { setAuthMode("register"); document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="cta-primary"
                  style={{ padding: "16px 38px", borderRadius: 50, color: "#000", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", letterSpacing: .5 }}>
                  {t("無料で始める →", "Start for free →")}
                </button>
                <a href="/radio/shiopixel" target="_blank" className="cta-ghost"
                  style={{ padding: "16px 32px", borderRadius: 50, border: "1px solid rgba(255,255,255,.14)", color: "rgba(255,255,255,.75)", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, backdropFilter: "blur(8px)", background: "rgba(255,255,255,.04)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  {t("サンプルを聴く", "Hear a demo")}
                </a>
              </div>

              {/* Stats bar */}
              <div className="fade-up-4" style={{ display: "inline-flex", gap: 32, padding: "14px 32px", borderRadius: 20, background: "rgba(255,255,255,.04)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.07)" }}>
                {[
                  { val: "30", label: t("無料トラック", "free tracks") },
                  { val: "5秒", label: t("でライブ", "to go live") },
                  { val: "AI", label: t("カバー自動生成", "cover art") },
                  { val: "¥0", label: t("初期費用", "upfront cost") },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: gold }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll indicator */}
            <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "fadeUp .7s 1.2s ease both", opacity: 0 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,.2)" }}>SCROLL</div>
              <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(201,169,98,.4), transparent)" }} />
            </div>
          </div>

          {/* ── LIVE TRACKS ──────────────────────────────────────── */}
          {featuredTracks.length > 0 && (
            <div style={{ padding: "80px 24px" }}>
              <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 4, color: gold, marginBottom: 8 }}>{t("いまSOLUNAで流れている", "NOW PLAYING ON SOLUNA")}</div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{t("世界中のアーティストの音楽", "Music from artists worldwide")}</h2>
                  </div>
                  <a href="/music" style={{ fontSize: 12, color: gold, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, border: `1px solid rgba(201,169,98,.2)`, padding: "8px 18px", borderRadius: 20 }}>
                    {t("すべて見る", "View all")} →
                  </a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
                  {featuredTracks.map((track, i) => {
                    const cover = track.cover_url || `/api/v1/tracks/${track.id}/cover`;
                    const isPlaying = previewId === track.id;
                    return (
                      <div key={track.id} className="track-row"
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,.025)", border: `1px solid ${isPlaying ? "rgba(201,169,98,.3)" : "rgba(255,255,255,.05)"}`, cursor: "pointer", animation: `fadeUp .5s ${.05 * i}s ease both` }}
                        onClick={() => previewTrack(track)}
                      >
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img src={cover} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", background: "#111", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).src = `/api/v1/tracks/${track.id}/cover`; }} />
                          <div className="play-overlay" style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: isPlaying ? 1 : 0, transition: "opacity .15s" }}>
                            {isPlaying
                              ? <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 20 }}>{[0,80,160,240,0].map((d,j) => <span key={j} className="eq-bar" style={{ animationDelay: `${d}ms`, height: j===2?20:j%2===0?8:14 }} />)}</div>
                              : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                            }
                          </div>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: isPlaying ? gold : "#fff" }}>{track.title}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 3 }}>{track.artist}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                          {track.genre && <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)", background: "rgba(255,255,255,.05)", padding: "2px 7px", borderRadius: 10 }}>{track.genre}</span>}
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)" }}>{track.play_count || 0} {t("再生", "plays")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── FEATURES ─────────────────────────────────────────── */}
          <div style={{ padding: "80px 24px", background: "linear-gradient(to bottom, transparent, rgba(201,169,98,.03), transparent)" }}>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 56 }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: gold, marginBottom: 12 }}>{t("なぜSOLUNAか", "WHY SOLUNA")}</div>
                <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, margin: 0 }}>
                  {t("アーティストに必要なすべてが、ここにある。", "Everything an artist needs, all in one place.")}
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
                {[
                  { img: "/images/feature_instant.jpg", tag: t("即時公開", "INSTANT"), title: t("アップロードして5秒で公開", "Live in 5 seconds"), desc: t("MP3/WAV/FLACをドロップするだけ。リスナーにすぐ届けられます。", "Drop your MP3, WAV, or FLAC. Fans can listen immediately — no approval queue.") },
                  { img: "/images/feature_cover.jpg", tag: "AI ART", title: t("AIがカバーを自動生成", "AI-generated cover art"), desc: t("曲のジャンルと雰囲気を読み取り、プロ品質のアートワークを生成します。", "Gemini analyzes your track's genre and mood to create stunning professional artwork.") },
                  { img: "/images/feature_rights.jpg", tag: t("著作権保護", "RIGHTS"), title: t("著作権を即時登録", "Instant copyright protection"), desc: t("ISRC発行・SHA256ハッシュ証明・ブロックチェーンアンカリングで権利を守ります。", "ISRC issuance, SHA-256 hash proof, and blockchain anchoring protect every upload.") },
                  { img: "/images/feature_radio.jpg", tag: t("チャンネル", "RADIO"), title: t("あなた専用ラジオが誕生", "Your personal radio channel"), desc: t("1曲アップするとラジオURLが自動発行。SNSでシェアするだけでファンが集まります。", "First upload creates your channel URL automatically. Share it and fans tune in.") },
                  { img: "/images/feature_royalty.jpg", tag: t("収益化 β", "EARN β"), title: t("30秒再生でロイヤリティ記録", "Royalties tracked per play"), desc: t("業界標準の30秒基準で再生を計測。将来の支払いに向けてログを蓄積します。", "Industry-standard 30-second threshold. Plays are logged, royalty-ready for future payouts.") },
                  { img: "/images/artist_life.jpg", tag: t("無料プラン", "FREE"), title: t("30曲まで完全無料", "30 tracks, completely free"), desc: t("クレジットカード不要。まずは試して、気に入ったらプロプランへ。", "No credit card required. Try it out. Upgrade when you're ready to scale.") },
                ].map((f, i) => (
                  <div key={i} className="feat-card" style={{ borderRadius: 20, overflow: "hidden", background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)" }}>
                    <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                      <img src={f.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.7) saturate(1.2)" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)" }} />
                      <span style={{ position: "absolute", top: 12, left: 12, fontSize: 9, letterSpacing: 3, color: gold, background: "rgba(0,0,0,.6)", padding: "4px 10px", borderRadius: 12, backdropFilter: "blur(4px)", border: `1px solid rgba(201,169,98,.25)` }}>{f.tag}</span>
                    </div>
                    <div style={{ padding: "20px 20px 24px" }}>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#fff" }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.7 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── HOW IT WORKS ─────────────────────────────────────── */}
          <div style={{ padding: "80px 24px" }}>
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: gold, marginBottom: 12 }}>{t("使い方", "HOW IT WORKS")}</div>
                <h2 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, margin: 0 }}>
                  {t("3ステップで世界デビュー", "3 steps to the world")}
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { step: "01", icon: "🎵", title: t("アカウント作成", "Create your account"), desc: t("名前とメールだけ。30秒で完了。クレカ不要。", "Just your name and email. Done in 30 seconds. No credit card.") },
                  { step: "02", icon: "📁", title: t("音楽をドロップ", "Drop your music"), desc: t("MP3・WAV・FLACをドラッグ＆ドロップ。複数ファイル同時対応。", "Drag and drop MP3, WAV, or FLAC. Multiple files at once are fine.") },
                  { step: "03", icon: "🚀", title: t("チャンネルを共有", "Share your channel"), desc: t("自動生成されたURLをSNSに貼るだけ。ファンがすぐに聴ける。", "Paste the auto-generated URL on social media. Fans can listen immediately.") },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 24, padding: "28px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                      <div style={{ width: 52, height: 52, borderRadius: "50%", background: `rgba(201,169,98,.1)`, border: `1px solid rgba(201,169,98,.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{step.icon}</div>
                      {i < 2 && <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,.05)", marginTop: 8 }} />}
                    </div>
                    <div style={{ paddingTop: 12 }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: gold, marginBottom: 6 }}>STEP {step.step}</div>
                      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{step.title}</div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)", lineHeight: 1.7 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CHANNELS ─────────────────────────────────────────── */}
          {featuredChannels.length > 0 && (
            <div style={{ padding: "40px 24px 80px" }}>
              <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <div style={{ fontSize: 10, letterSpacing: 4, color: gold, marginBottom: 10 }}>{t("アーティストチャンネル", "ARTIST CHANNELS")}</div>
                  <h2 style={{ fontSize: "clamp(20px,3.5vw,32px)", fontWeight: 800, margin: 0 }}>{t("いま活躍しているアーティスト", "Artists on SOLUNA now")}</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
                  {featuredChannels.map((ch, i) => (
                    <a key={ch.slug} href={`/radio/${ch.slug}`} target="_blank" className="ch-card"
                      style={{ display: "block", padding: "22px 20px", borderRadius: 18, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", textDecoration: "none", color: "#fff", animation: `fadeUp .5s ${.1*i}s ease both` }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `rgba(201,169,98,.1)`, border: `1px solid rgba(201,169,98,.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>🎙</div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ch.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 10 }}>{ch.creator}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>{ch.track_count} {t("曲", "tracks")}</span>
                        <span style={{ fontSize: 11, color: gold }}>▶ {t("聴く", "Listen")}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CTA + AUTH ───────────────────────────────────────── */}
          <div id="auth-section" style={{ position: "relative", padding: "80px 24px 120px", overflow: "hidden" }}>
            {/* BG image */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/artist_life.jpg)", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(.2) saturate(1.3)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(201,169,98,.06) 0%, transparent 70%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #05060a 0%, rgba(5,6,10,.7) 50%, rgba(5,6,10,.9) 100%)" }} />

            <div style={{ position: "relative", zIndex: 2, maxWidth: 880, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              {/* Left: copy */}
              <div className="slide-left">
                <div style={{ fontSize: 10, letterSpacing: 4, color: gold, marginBottom: 16 }}>{t("今すぐ始めよう", "START TODAY")}</div>
                <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15 }}>
                  {t("あなたの音楽を、", "Your music")}<br />
                  <span style={{ color: gold }}>{t("世界に解き放て。", "deserves to be heard.")}</span>
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.45)", lineHeight: 1.8, marginBottom: 28 }}>
                  {t(
                    "今日登録すれば、今日から曲を公開できます。審査なし、コスト0円、インフラ不要。",
                    "Register today and publish your first track today. No approval process, no cost, no infrastructure to manage."
                  )}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    t("✓ 無料でトラック30曲まで", "✓ Up to 30 tracks, completely free"),
                    t("✓ クレジットカード不要", "✓ No credit card required"),
                    t("✓ 登録30秒、即公開", "✓ 30-second signup, instant publish"),
                    t("✓ AIカバーアート自動生成", "✓ AI cover art generated automatically"),
                  ].map((item, i) => (
                    <div key={i} style={{ fontSize: 14, color: "rgba(255,255,255,.6)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: gold }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: auth form */}
              <div className="slide-right">
                <div style={{ background: "rgba(5,6,10,.85)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, padding: "36px 32px", backdropFilter: "blur(20px)" }}>
                  {/* Tab switcher */}
                  <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "rgba(255,255,255,.05)", borderRadius: 12, padding: 3 }}>
                    {(["register", "login"] as const).map(mode => (
                      <button key={mode} onClick={() => setAuthMode(mode)}
                        style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all .2s",
                          background: authMode === mode ? `linear-gradient(135deg, ${gold}, #a88b3d)` : "transparent",
                          color: authMode === mode ? "#000" : "rgba(255,255,255,.4)" }}>
                        {mode === "register" ? t("新規登録", "Sign up") : t("ログイン", "Sign in")}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {authMode === "register" && (
                      <input type="text" placeholder={t("アーティスト名（例：Shiopixel）", "Artist name (e.g. Shiopixel)")} value={authName} onChange={e => setAuthName(e.target.value)} style={inp} />
                    )}
                    <input type="email" placeholder={t("メールアドレス", "Email address")} value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={inp} />
                    <input type="password" placeholder={t("パスワード（8文字以上）", "Password (8 or more characters)")} value={authPassword} onChange={e => setAuthPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} style={inp} />

                    {authMsg && (
                      <div style={{ fontSize: 12, color: "#f87171", padding: "8px 12px", background: "rgba(248,113,113,.08)", borderRadius: 8, border: "1px solid rgba(248,113,113,.15)" }}>
                        {authMsg}
                      </div>
                    )}

                    <button onClick={handleAuth} disabled={authLoading}
                      style={{ marginTop: 4, padding: "14px", borderRadius: 12, border: "none", background: authLoading ? "rgba(201,169,98,.3)" : `linear-gradient(135deg, ${gold}, #a88b3d)`, color: "#000", fontWeight: 800, fontSize: 15, cursor: authLoading ? "default" : "pointer", transition: "filter .15s" }}>
                      {authLoading ? "…" : authMode === "register" ? t("無料アカウントを作成 →", "Create free account →") : t("ログイン →", "Sign in →")}
                    </button>

                    {authMode === "register" && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", textAlign: "center", lineHeight: 1.6 }}>
                        {t("登録することで利用規約に同意したものとみなされます。", "By signing up, you agree to our Terms of Service.")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      {user && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 80px" }}>

          {/* Drop zone */}
          <style>{`
            @keyframes dropPulse { 0%,100%{border-color:rgba(201,169,98,0.25)} 50%{border-color:rgba(201,169,98,0.55)} }
            .drop-active { animation: dropPulse .8s ease-in-out infinite !important; }
          `}</style>
          <div
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            className={dragging ? "drop-active" : ""}
            style={{
              border: `2px dashed ${dragging ? gold : "rgba(255,255,255,0.08)"}`,
              borderRadius: 24, padding: "44px 28px", textAlign: "center", cursor: "pointer",
              background: dragging ? "rgba(201,169,98,0.05)" : "rgba(255,255,255,0.01)",
              transition: "background .2s, border-color .2s", marginBottom: 24, userSelect: "none",
            }}
          >
            <input id="file-input" type="file" accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg" multiple style={{ display: "none" }} onChange={onFileInput} />
            <div style={{ fontSize: 40, marginBottom: 12, filter: dragging ? "none" : "grayscale(0.3)" }}>
              {dragging ? "🎵" : "🎶"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: dragging ? gold : "#fff" }}>
              {dragging ? t("ドロップしてアップロード！", "Drop to upload!") : t("曲をドロップ", "Drop or tap to add tracks")}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginBottom: 16 }}>
              {t("MP3・WAV・FLAC・M4A に対応", "MP3, WAV, FLAC, M4A supported")}
            </div>
            <div style={{ display: "inline-flex", gap: 20, fontSize: 11, color: "rgba(255,255,255,.18)" }}>
              <span>⚡ {t("即再生", "Instant play")}</span>
              <span>📡 {t("チャンネル自動作成", "Auto channel")}</span>
              <span>🎨 {t("カバー自動生成", "Auto cover art")}</span>
              <span>🔒 {t("権利自動登録", "Rights protected")}</span>
            </div>
          </div>

          {/* Channel ready banner */}
          {radioSlug && items.some(x => x.status === "done") && (
            <div style={{
              background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.2)",
              borderRadius: 16, padding: "16px 20px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: gold, marginBottom: 4 }}>
                  🎵 {t("チャンネル準備完了！", "Your channel is live!")}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: "monospace" }}>
                  {window.location.origin}/radio/{radioSlug}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={copyChannelUrl} style={{
                  padding: "7px 16px", borderRadius: 20, border: `1px solid rgba(201,169,98,0.3)`,
                  background: copied ? "rgba(74,222,128,.12)" : "rgba(201,169,98,0.1)",
                  color: copied ? "#4ade80" : gold, fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>
                  {copied ? t("コピー済み！", "Copied!") : t("URLをコピー", "Copy URL")}
                </button>
                <a href={`/radio/${radioSlug}`} target="_blank" style={{
                  padding: "7px 16px", borderRadius: 20, background: `linear-gradient(135deg, ${gold}, #a88b3d)`,
                  color: "#000", fontSize: 11, fontWeight: 700, textDecoration: "none",
                }}>
                  ▶ {t("再生する", "Play now")}
                </a>
              </div>
            </div>
          )}

          {/* Staging / upload items */}
          {items.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,.2)", marginBottom: 12 }}>
                {t("処理中", "PROCESSING")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map(item => (
                  <StagingCard key={item.uid} item={item} lang={lang}
                    onPlay={item.track ? () => playTrack(item.track!.id) : undefined}
                    isPlaying={item.track ? currentTrackId === item.track.id && isPlaying : false}
                    onDismiss={() => setItems(prev => prev.filter(x => x.uid !== item.uid))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Track library */}
          {tracks.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,.2)" }}>
                  {t(`${tracks.length} 曲`, `${tracks.length} TRACKS`)}
                </div>
                {radioSlug && (
                  <a href={`/radio/${radioSlug}`} target="_blank" style={{ fontSize: 12, color: gold, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    {t("チャンネルで聴く", "Open channel")}
                  </a>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {tracks.map(track => (
                  <TrackCard key={track.id} track={track} lang={lang}
                    playing={currentTrackId === track.id && isPlaying}
                    onPlay={() => playTrack(track.id)}
                    onGenerateCover={() => generateCover(track)}
                    onSaveMeta={(updates) => saveTrackMeta(track.id, updates)}
                  />
                ))}
              </div>
            </div>
          )}

          {tracks.length === 0 && items.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.12)", fontSize: 13 }}>
              {t("上のゾーンに曲をドロップしてください", "Drop your tracks above to get started")}
            </div>
          )}
        </div>
      )}

      <footer style={{ borderTop: "1px solid rgba(255,255,255,.04)", padding: "24px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 10, flexWrap: "wrap" }}>
          <a href="/festivals" style={{ color: "rgba(255,255,255,.25)", fontSize: 11, textDecoration: "none" }}>{t("フェス", "Festival")}</a>
          <a href="/contests" style={{ color: "rgba(255,255,255,.25)", fontSize: 11, textDecoration: "none" }}>{t("コンテスト", "Contest")}</a>
          <a href="/community" style={{ color: "rgba(255,255,255,.25)", fontSize: 11, textDecoration: "none" }}>{t("コミュニティ", "Community")}</a>
          <a href="/live" style={{ color: "rgba(255,255,255,.25)", fontSize: 11, textDecoration: "none" }}>LIVE</a>
          <a href="/music" style={{ color: "rgba(255,255,255,.25)", fontSize: 11, textDecoration: "none" }}>{t("音楽", "Music")}</a>
          <a href="/developers" style={{ color: "rgba(255,255,255,.25)", fontSize: 11, textDecoration: "none" }}>API</a>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.08)", letterSpacing: 3 }}>SOLUNA FEST HAWAII 2026</div>
      </footer>
    </div>
  );
}

// ── Staging card (uploading / done / duplicate / error) ──────────────────────
function StagingCard({ item, lang, onPlay, isPlaying, onDismiss }: {
  item: StagingItem; lang: string;
  onPlay?: () => void; isPlaying: boolean; onDismiss: () => void;
}) {
  _lang = lang;
  const statusColors: Record<StageStatus, string> = {
    analyzing: "rgba(255,255,255,0.05)", ready: "rgba(255,255,255,0.03)",
    uploading: "rgba(255,255,255,0.03)", done: "rgba(74,222,128,0.04)",
    error: "rgba(248,113,113,0.05)", duplicate: "rgba(251,191,36,0.05)",
  };
  const borderColors: Record<StageStatus, string> = {
    analyzing: "rgba(255,255,255,0.08)", ready: "rgba(255,255,255,0.08)",
    uploading: "rgba(201,169,98,0.2)", done: "rgba(74,222,128,0.2)",
    error: "rgba(248,113,113,0.2)", duplicate: "rgba(251,191,36,0.2)",
  };

  const isDup = item.status === "duplicate";
  const displayTrack = isDup ? item.duplicateTrack : item.track;
  const coverSrc = isDup ? (item.duplicateTrack?.cover_url || "") : (item.track?.cover_url || item.coverUrl);

  return (
    <div style={{
      display: "flex", gap: 14, padding: "14px 16px",
      background: statusColors[item.status], borderRadius: 14,
      border: `1px solid ${borderColors[item.status]}`,
    }}>
      {/* Cover */}
      <div style={{
        width: 64, height: 64, borderRadius: 10, flexShrink: 0, overflow: "hidden",
        background: "rgba(255,255,255,.04)",
      }}>
        {coverSrc
          ? <img src={coverSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎵</div>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.title}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
              {item.artist}{item.album ? ` · ${item.album}` : ""}{item.genre ? ` · ${item.genre}` : ""}
            </div>
          </div>
          <button onClick={onDismiss} style={{ background: "none", border: "none", color: "rgba(255,255,255,.2)", cursor: "pointer", fontSize: 16, padding: 0, flexShrink: 0, lineHeight: 1 }}>×</button>
        </div>

        {/* Status row */}
        <div style={{ marginTop: 8 }}>
          {item.status === "analyzing" && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: gold, animation: "pulse 1s infinite" }} />
              {t("メタデータ取得中…", "Fetching metadata…")}
            </div>
          )}
          {item.status === "uploading" && (
            <div>
              <div style={{ height: 2, background: "rgba(255,255,255,.06)", borderRadius: 1, marginBottom: 4 }}>
                <div style={{ height: "100%", width: `${item.progress}%`, background: gold, borderRadius: 1, transition: "width .3s" }} />
              </div>
              <div style={{ fontSize: 11, color: gold }}>{t("アップロード中…", "Uploading…")}</div>
            </div>
          )}
          {item.status === "done" && item.track && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#4ade80" }}>✓ {t("登録完了", "Registered")}</span>
              {item.track.isrc && <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)", fontFamily: "monospace" }}>{item.track.isrc}</span>}
              {item.track.audio_hash && <span style={{ fontSize: 10, color: "rgba(255,255,255,.15)", fontFamily: "monospace" }}>SHA256:{item.track.audio_hash.slice(0,10)}…</span>}
              {item.lyricsPreview && (
                <span style={{ fontSize: 10, color: "#a78bfa" }}>♫ {t("歌詞あり", "Lyrics found")}</span>
              )}
              <a href={`/api/v1/tracks/${item.track.id}/proof`} target="_blank" style={{ fontSize: 10, color: "rgba(255,255,255,.2)", textDecoration: "none", padding: "1px 7px", borderRadius: 4, border: "1px solid rgba(255,255,255,.1)" }}>
                {t("証明書", "Proof")}
              </a>
            </div>
          )}
          {item.status === "error" && (
            <div style={{ fontSize: 11, color: "#f87171" }}>✗ {item.error}</div>
          )}
          {isDup && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#fbbf24" }}>≡ {t("すでに登録済み", "Already registered")}</span>
              {item.duplicateId && (
                <>
                  <a href={`/api/v1/tracks/${item.duplicateId}/proof`} target="_blank" style={{ fontSize: 10, color: "#fbbf24", textDecoration: "none", padding: "1px 7px", borderRadius: 4, border: "1px solid rgba(251,191,36,.3)" }}>
                    {t("証明書を見る", "View proof")}
                  </a>
                  <a href={`/api/v1/tracks/${item.duplicateId}/stream`} target="_blank" style={{ fontSize: 10, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
                    {t("既存トラックを再生", "Play existing")}
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        {/* Lyrics preview */}
        {item.lyricsPreview && item.status === "done" && (
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,.25)", fontStyle: "italic", whiteSpace: "pre-line", lineHeight: 1.5 }}>
            "{item.lyricsPreview}"
          </div>
        )}
      </div>

      {/* Play button */}
      {(item.status === "done" && item.track && onPlay) && (
        <button onClick={onPlay} style={{
          width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
          background: isPlaying ? gold : "rgba(255,255,255,.06)",
          color: isPlaying ? "#000" : "rgba(255,255,255,.5)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
        }}>
          {isPlaying ? "⏸" : "▶"}
        </button>
      )}
    </div>
  );
}

// ── Track card (registered track in library) ─────────────────────────────────
function TrackCard({ track, lang, playing, onPlay, onGenerateCover, onSaveMeta }: {
  track: TrackMeta; lang: string; playing: boolean;
  onPlay: () => void; onGenerateCover: () => void;
  onSaveMeta: (updates: Partial<TrackMeta>) => void;
}) {
  _lang = lang;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist || "");
  const [genre, setGenre] = useState(track.genre || "");
  const [album, setAlbum] = useState(track.album || "");
  const [saving, setSaving] = useState(false);

  const cover = track.cover_url;
  const isConfirmed = track.rights_status === "confirmed";

  const save = async () => {
    setSaving(true);
    await onSaveMeta({ title, artist, genre: genre || undefined, album: album || undefined });
    setSaving(false); setEditing(false);
  };

  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${playing ? "rgba(201,169,98,0.25)" : "rgba(255,255,255,0.05)"}`,
      background: playing ? "rgba(201,169,98,0.04)" : "rgba(255,255,255,0.015)",
      transition: "all .15s", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
        {/* Cover */}
        <div style={{ width: 52, height: 52, borderRadius: 8, flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,.04)", position: "relative" }}>
          {cover
            ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            : (
              <button onClick={onGenerateCover} title={t("カバーアートを生成", "Generate cover art")} style={{
                width: "100%", height: "100%", background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2,
                color: "rgba(255,255,255,.2)", fontSize: 18,
              }}>
                <span>+</span>
                <span style={{ fontSize: 7, letterSpacing: 0.5 }}>ART</span>
              </button>
            )
          }
        </div>

        {/* Info or Edit form */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ flex: 2, padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.4)", color: "#fff", fontSize: 12, outline: "none" }} />
                <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist" style={{ flex: 1, padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.4)", color: "#fff", fontSize: 12, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="Genre" style={{ flex: 1, padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.4)", color: "#fff", fontSize: 12, outline: "none" }} />
                <input value={album} onChange={e => setAlbum(e.target.value)} placeholder="Album" style={{ flex: 1, padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.4)", color: "#fff", fontSize: 12, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={save} disabled={saving} style={{ flex: 1, padding: "5px", borderRadius: 6, border: "none", background: gold, color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "…" : t("保存", "Save")}
                </button>
                <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "5px", borderRadius: 6, border: "1px solid rgba(255,255,255,.1)", background: "none", color: "rgba(255,255,255,.4)", fontSize: 11, cursor: "pointer" }}>
                  {t("キャンセル", "Cancel")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {track.artist && <span>{track.artist}</span>}
                {track.genre && <span style={{ color: "rgba(255,255,255,.2)" }}>{track.genre}</span>}
                {track.album && <span style={{ color: "rgba(255,255,255,.2)" }}>{track.album}</span>}
                {track.isrc && <span style={{ fontFamily: "monospace", fontSize: 10 }}>{track.isrc}</span>}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {isConfirmed && <span style={{ fontSize: 10, color: "#4ade80" }}>✓</span>}
          {track.anchor_tx && <span style={{ fontSize: 12, color: "#a78bfa" }}>⛓</span>}

          {!editing && (
            <button onClick={() => setEditing(true)} style={{
              background: "none", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.3)",
              fontSize: 10, padding: "3px 8px", borderRadius: 5, cursor: "pointer",
            }}>{t("編集", "Edit")}</button>
          )}

          <a href={`/api/v1/tracks/${track.id}/proof`} target="_blank" style={{
            fontSize: 10, color: "rgba(255,255,255,.2)", textDecoration: "none",
            padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,.08)",
          }}>{t("証明書", "Proof")}</a>

          <button onClick={onPlay} style={{
            width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer",
            background: playing ? gold : "rgba(255,255,255,.05)",
            color: playing ? "#000" : "rgba(255,255,255,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>
            {playing ? "⏸" : "▶"}
          </button>
        </div>
      </div>
    </div>
  );
}
