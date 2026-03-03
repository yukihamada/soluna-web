"use client";

import { isStageActive } from "@/lib/stage";
import VideoBackground from "@/components/stages/VideoBackground";
import SoundToggle from "@/components/stages/SoundToggle";
import HeroTeaser from "@/components/stages/HeroTeaser";
import CountdownSection from "@/components/stages/CountdownSection";
import LineupSection from "@/components/stages/LineupSection";
import PartnerSection from "@/components/stages/PartnerSection";
import SiteFooter from "@/components/stages/SiteFooter";

export default function Home() {
  return (
    <main className="relative">
      {/* Always visible */}
      <VideoBackground />
      <SoundToggle />

      {/* Stage 3+: Ticker */}
      {isStageActive(3) && (
        <div className="ticker-wrap no-print">
          <div className="ticker-track">
            {[0, 1].map((k) => (
              <span key={k} style={{ display: "flex" }}>
                {[
                  "ZAMNA HAWAII 2026",
                  "SEP 4\u20135 \u00B7 OAHU, HAWAII",
                  "TICKETS FROM $120",
                  "VIP FROM $1,000",
                  "UNDERGROUND ELECTRONIC",
                  "MOANALUA GARDENS",
                  "850K+ GLOBAL ATTENDEES",
                  "ZAMNAHAWAII.TICKETBLOX.COM",
                ].map((item, i) => (
                  <span key={i} className="ticker-item">
                    {item}
                    <span className="ticker-sep"> · </span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stage 1: Hero + date + email signup */}
      <HeroTeaser />

      {/* Stage 2+: Countdown + stats */}
      {isStageActive(2) && <CountdownSection />}

      {/* Stage 3+: Lineup / date & place */}
      {isStageActive(3) && <LineupSection />}

      {/* Stage 4+: Partners + SOLUNA */}
      {isStageActive(4) && <PartnerSection />}

      {/* Always visible (content adapts by stage) */}
      <SiteFooter />
    </main>
  );
}
