"use client";
import WalletGate from "@/components/WalletGate";
import Link from "next/link";

const VIP_COLLECTION = process.env.NEXT_PUBLIC_VIP_COLLECTION || "";

export default function VipLoungePage() {
  return (
    <WalletGate collectionAddress={VIP_COLLECTION} passName="SOLUNA VIP Pass">
      <div style={{ minHeight: "100vh", background: "#080808" }}>
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,98,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Nav */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(8,8,8,0.92)", backdropFilter: "blur(12px)",
        }}>
          <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            SOLUNA FEST HAWAII
          </Link>
          <span style={{ fontSize: 10, color: "rgba(201,169,98,0.7)", letterSpacing: "0.2em", border: "1px solid rgba(201,169,98,0.3)", borderRadius: 999, padding: "4px 12px" }}>
            VIP PASS
          </span>
        </nav>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginBottom: 16 }}>
            SOLUNA x SOLANA — VIP Exclusive
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.4rem,8vw,4rem)", color: "#fff", marginBottom: 40 }}>
            VIP Lounge
          </h1>

          {/* VIP Perks */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16 }}>
              Your VIP Benefits
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { title: "Priority Entry", desc: "Dedicated VIP entrance — skip the line" },
                { title: "Premium Viewing", desc: "Elevated platform with unobstructed stage view" },
                { title: "Open Bar", desc: "Complimentary premium drinks all night" },
                { title: "Artist Meet & Greet", desc: "Backstage access during designated times" },
                { title: "Lounge Access", desc: "Air-conditioned VIP lounge with seating" },
                { title: "Concierge", desc: "Dedicated concierge for any requests" },
              ].map(perk => (
                <div key={perk.title} style={{ background: "rgba(201,169,98,0.04)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 12, padding: "18px 20px" }}>
                  <p style={{ color: "rgba(201,169,98,0.9)", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{perk.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.5 }}>{perk.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Concierge Contact */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16 }}>
              Concierge
            </h2>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px" }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
                Your VIP concierge is available from check-in until the end of the event. Whether you need transportation, dining reservations, or special accommodations, we are here to help.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="mailto:vip@solun.art" style={{
                  padding: "12px 24px", borderRadius: 999,
                  background: "rgba(201,169,98,0.15)", border: "1px solid rgba(201,169,98,0.3)",
                  color: "rgba(201,169,98,0.9)", fontSize: 13, fontWeight: 600,
                  textDecoration: "none", letterSpacing: "0.06em",
                }}>
                  Email Concierge
                </a>
                <span style={{ padding: "12px 24px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                  On-site: VIP Desk near Gate B
                </span>
              </div>
            </div>
          </section>

          {/* VIP Area Map */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16 }}>
              VIP Area Guide
            </h2>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px" }}>
              {[
                { zone: "VIP Entrance", location: "Gate B (North side)", time: "Opens 16:30" },
                { zone: "VIP Lounge", location: "Behind Main Stage, elevated platform", time: "All event" },
                { zone: "VIP Bar", location: "Inside VIP Lounge", time: "17:00 - 23:30" },
                { zone: "Meet & Greet", location: "Green Room corridor", time: "19:00 - 20:00" },
                { zone: "VIP Restrooms", location: "Adjacent to VIP Lounge", time: "All event" },
              ].map(zone => (
                <div key={zone.zone} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{zone.zone}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{zone.location}</p>
                  </div>
                  <span style={{ color: "rgba(201,169,98,0.7)", fontSize: 12, flexShrink: 0 }}>{zone.time}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em" }}>
            SOLUNA FEST HAWAII 2026 · VIP Lounge · NFT-Gated
          </p>
        </footer>
      </div>
    </WalletGate>
  );
}
