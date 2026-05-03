"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Home",        href: "/" },
  { label: "Festivals",   href: "/festivals" },
  { label: "Lineup",      href: "/lineup" },
  { label: "Lab",         href: "/lab" },
  { label: "Vision",      href: "/vision" },
  { label: "Community",   href: "/community" },
  { label: "Tickets",     href: "/tickets" },
];

const DOCK = [
  { icon: "🏠", label: "Home",       href: "/" },
  { icon: "🎪", label: "Festivals",  href: "/festivals" },
  { icon: "🎤", label: "Lineup",     href: "/lineup" },
  { icon: "🍄", label: "Lab",        href: "/lab" },
  { icon: "💬", label: "Community",  href: "/community" },
  { icon: "🎫", label: "Tickets",    href: "/tickets" },
  { icon: "👤", label: "Login",      href: "/login" },
];

const PAGE_TITLES: Record<string, string> = {
  "/":           "SOLUNA — Desktop",
  "/festivals":  "Festivals",
  "/lineup":     "Lineup",
  "/lab":        "SOLUNA Lab",
  "/vision":     "Vision",
  "/community":  "Community",
  "/tickets":    "Tickets",
  "/guide":      "Guide",
  "/info":       "Info & Access",
  "/vip":        "VIP",
  "/artist":     "Artist",
  "/music":      "Music",
  "/investor":   "Investor",
  "/login":      "Login",
  "/privacy":    "Privacy",
  "/terms":      "Terms",
  "/safety":     "Safety",
  "/press":      "Press",
  "/schedule":   "Schedule",
};

// These pages render their own full-screen desktop UI
const EXCLUDED = new Set(["/"]);

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Tokyo" }) + " JST");
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>{time}</span>;
}

export default function MacShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [dockHover, setDockHover] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFrame, setIsFrame] = useState(false);
  const [shellReady, setShellReady] = useState(false);

  useEffect(() => {
    const frame = new URLSearchParams(window.location.search).get("frame") === "1";
    setIsFrame(frame);
    setShellReady(true);
  }, []);

  if (EXCLUDED.has(pathname)) return <>{children}</>;
  if (!shellReady || isFrame) return <>{children}</>;

  const slug = pathname.split("/").filter(Boolean).join(" ").replace(/-/g, " ");
  const title = PAGE_TITLES[pathname] ?? (slug || "SOLUNA");

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(20,12,4,1) 0%, #080808 60%)",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── macOS menu bar ── */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 28,
        background: "rgba(10,8,6,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 12,
        paddingRight: 16,
        gap: 0,
        zIndex: 1000,
        userSelect: "none",
      }}>
        {/* Apple-style logo → SOLUNA */}
        <Link href="/" style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 13,
          color: "#c9a962",
          letterSpacing: "0.08em",
          textDecoration: "none",
          marginRight: 20,
          flexShrink: 0,
        }}>⬡ SOLUNA</Link>

        {/* Menu items — desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} style={{
              fontSize: 12,
              color: pathname === n.href ? "#fff" : "rgba(255,255,255,0.5)",
              fontWeight: pathname === n.href ? 600 : 400,
              textDecoration: "none",
              padding: "2px 10px",
              borderRadius: 4,
              background: pathname === n.href ? "rgba(255,255,255,0.1)" : "transparent",
              transition: "background 0.1s, color 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = pathname === n.href ? "rgba(255,255,255,0.1)" : "transparent")}
            >
              {n.label}
            </Link>
          ))}
        </div>

        {/* Right: clock */}
        <Clock />
      </div>

      {/* ── Window chrome ── */}
      <div style={{
        flex: 1,
        marginTop: 28,
        marginBottom: 64,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Title bar */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: 36,
          flexShrink: 0,
          position: "sticky",
          top: 28,
          zIndex: 100,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}>
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6, marginRight: 14 }}>
            <Link href="/" style={{
              width: 12, height: 12, borderRadius: "50%",
              background: "#ff5f57",
              display: "block",
              border: "1px solid rgba(0,0,0,0.2)",
              flexShrink: 0,
            }} title="Close → Home" />
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: "#febc2e",
              border: "1px solid rgba(0,0,0,0.2)",
              flexShrink: 0,
            }} />
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: "#28c840",
              border: "1px solid rgba(0,0,0,0.2)",
              flexShrink: 0,
            }} />
          </div>
          {/* Window title */}
          <div style={{
            flex: 1,
            textAlign: "center",
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.02em",
            pointerEvents: "none",
          }}>
            {title}
          </div>
          {/* Breadcrumb back */}
          {pathname !== "/" && (
            <Link href="/" style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.25)",
              textDecoration: "none",
              flexShrink: 0,
            }}>← Home</Link>
          )}
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </div>

      {/* ── Dock ── */}
      <div style={{
        position: "fixed",
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 18,
        padding: "6px 10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}>
        {DOCK.map(d => {
          const isHovered = dockHover === d.href;
          const isActive = pathname === d.href;
          return (
            <Link key={d.href} href={d.href}
              onMouseEnter={() => setDockHover(d.href)}
              onMouseLeave={() => setDockHover(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                textDecoration: "none",
                transition: "transform 0.15s ease",
                transform: isHovered ? "translateY(-8px) scale(1.25)" : "translateY(0) scale(1)",
                position: "relative",
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: isActive
                  ? "rgba(201,169,98,0.25)"
                  : "rgba(255,255,255,0.06)",
                border: isActive
                  ? "1px solid rgba(201,169,98,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                boxShadow: isHovered ? "0 4px 16px rgba(0,0,0,0.4)" : "none",
              }}>
                {d.icon}
              </div>
              {isActive && (
                <div style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: "#c9a962",
                  position: "absolute",
                  bottom: -1,
                }} />
              )}
              {isHovered && (
                <div style={{
                  position: "absolute",
                  bottom: 52,
                  background: "rgba(0,0,0,0.8)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 5,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                  {d.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

    </div>
  );
}
