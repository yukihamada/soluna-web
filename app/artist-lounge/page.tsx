"use client";
import WalletGate from "@/components/WalletGate";
import Link from "next/link";

const ARTIST_COLLECTION = process.env.NEXT_PUBLIC_ARTIST_COLLECTION || "";

export default function ArtistLoungePage() {
  return (
    <WalletGate collectionAddress={ARTIST_COLLECTION} passName="ZAMNA Artist Pass">
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
            ZAMNA HAWAII
          </Link>
          <span style={{ fontSize: 10, color: "rgba(201,169,98,0.7)", letterSpacing: "0.2em", border: "1px solid rgba(201,169,98,0.3)", borderRadius: 999, padding: "4px 12px" }}>
            ARTIST PASS
          </span>
        </nav>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginBottom: 16 }}>
            SOLUNA x SOLANA — Artist Exclusive
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.4rem,8vw,4rem)", color: "#fff", marginBottom: 40 }}>
            Artist Lounge
          </h1>

          {/* Rider Information */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16 }}>
              Rider Information
            </h2>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px" }}>
              <div style={{ display: "grid", gap: 16 }}>
                {[
                  { label: "Sound Check", time: "14:00 - 16:00", note: "Main Stage" },
                  { label: "Doors Open", time: "17:00", note: "General / VIP" },
                  { label: "Show Start", time: "18:00", note: "Opening Act" },
                  { label: "Headliner", time: "21:00 - 23:00", note: "Main Stage" },
                  { label: "Curfew", time: "23:30", note: "Hard stop — city ordinance" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{item.label}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{item.note}</p>
                    </div>
                    <span style={{ color: "rgba(201,169,98,0.9)", fontSize: 16, fontWeight: 700 }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Backstage Map */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16 }}>
              Backstage Access
            </h2>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px" }}>
              {[
                { area: "Green Room A", access: "All artists", detail: "Catering, Wi-Fi, lockers" },
                { area: "Green Room B", access: "Headliners only", detail: "Private, sound-isolated" },
                { area: "Production Office", access: "Artist managers", detail: "Printer, meeting table" },
                { area: "Loading Dock", access: "Crew + artists", detail: "Equipment drop-off zone" },
              ].map(area => (
                <div key={area.area} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{area.area}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{area.detail}</p>
                  </div>
                  <span style={{ color: "rgba(74,222,128,0.8)", fontSize: 11, border: "1px solid rgba(74,222,128,0.3)", borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>
                    {area.access}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16 }}>
              Production Contacts
            </h2>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px" }}>
              {[
                { name: "Sean Tsai", role: "Production Director", contact: "On-site radio Ch. 3" },
                { name: "Stage Manager", role: "TBD", contact: "Radio Ch. 5" },
                { name: "Artist Liaison", role: "TBD", contact: "Direct line provided at check-in" },
              ].map(person => (
                <div key={person.name} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{person.name} — <span style={{ color: "rgba(201,169,98,0.7)", fontWeight: 400 }}>{person.role}</span></p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{person.contact}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em" }}>
            ZAMNA HAWAII 2026 · Artist Lounge · NFT-Gated
          </p>
        </footer>
      </div>
    </WalletGate>
  );
}
