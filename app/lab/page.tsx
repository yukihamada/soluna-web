"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7 },
  viewport: { once: true },
};

const MATERIALS = [
  {
    id: "mycelium",
    emoji: "🍄",
    name: "菌糸体断熱パネル",
    en: "Mycelium Insulation Panel",
    status: "testing",
    desc: "カワラタケ菌糸体とおがくず・籾殻を型成形し、60℃乾燥で完全不活化。外部エネルギーゼロで断熱材が育つ。グラスウールの代替として開発中。",
    spec: [
      { k: "構成", v: "カワラタケ菌糸体 + おがくず 70% + 籾殻 30%" },
      { k: "サイズ", v: "600 × 600 × 40 mm（試作）" },
      { k: "表面処理", v: "ホウ砂防火 + 亜麻仁油防水" },
      { k: "目標λ値", v: "≤ 0.045 W/(m·K)" },
    ],
    tests: [
      { name: "熱伝導率（JIS A 1412）", status: "running", org: "GBRC" },
      { name: "吸音率（NRC）", status: "running", org: "GBRC" },
      { name: "曲げ強度（JIS A 5905）", status: "pending", org: "GBRC" },
      { name: "難燃性（コーンカロリーメーター）", status: "pending", org: "GBRC" },
    ],
    price: null,
    note: "試験結果が出次第、ページを更新します。",
  },
  {
    id: "bamboo",
    emoji: "🎋",
    name: "竹集成パネル",
    en: "Bamboo Laminated Panel",
    status: "testing",
    desc: "接着剤不使用の熱圧縮成形で作る竹集成材。CLT代替として内装・構造面材への応用を検討中。国産竹材の有効活用。",
    spec: [
      { k: "製法", v: "無接着剤熱圧縮（圧縮率15〜20%）" },
      { k: "厚み", v: "12 mm（面材）" },
      { k: "原料", v: "国産竹材" },
      { k: "用途（検討中）", v: "内装面材・SIPs外装" },
    ],
    tests: [
      { name: "壁倍率試験", status: "pending", org: "GBRC" },
      { name: "建材適合性評価", status: "pending", org: "林産試験場" },
    ],
    price: null,
    note: "試験体製作中。",
  },
  {
    id: "籾殻",
    emoji: "🌾",
    name: "籾殻圧縮ボード",
    en: "Rice Husk Compressed Board",
    status: "dev",
    desc: "年間約160万トン発生する国内籾殻を圧縮成形した断熱ボード。焼却・廃棄されていた農業廃棄物を高性能建材に変換する。",
    spec: [
      { k: "原料", v: "籾殻（rice husk）" },
      { k: "コア厚み", v: "120 mm（SIPsコア想定）" },
      { k: "目標断熱性", v: "セルロースファイバー同等" },
      { k: "製造委託先", v: "調整中" },
    ],
    tests: [
      { name: "圧縮強度", status: "planned", org: "—" },
      { name: "熱伝導率", status: "planned", org: "—" },
    ],
    price: null,
    note: "製造パートナー調整中。",
  },
  {
    id: "sips",
    emoji: "🏗️",
    name: "SOLUNA SIPsパネル",
    en: "SOLUNA SIPs Panel",
    status: "dev",
    desc: "上記3素材を組み合わせた完成形。杉CLT（外面）+ 籾殻ボード（コア）+ 竹集成材（内面）の3層構造。キャビン1棟50〜100枚で完成する。",
    spec: [
      { k: "外面", v: "杉CLT 12 mm" },
      { k: "コア", v: "籾殻圧縮ボード 120 mm" },
      { k: "内面", v: "竹集成材 12 mm" },
      { k: "想定用途", v: "25 m² キャビン（弟子屈プロジェクト）" },
    ],
    tests: [],
    price: null,
    note: "各素材の試験完了後に統合試験を予定。",
  },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  running: { label: "試験中", color: "#86efac", bg: "rgba(34,197,94,0.15)" },
  pending: { label: "申込済み", color: "#fde047", bg: "rgba(234,179,8,0.12)" },
  planned: { label: "計画中", color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" },
};

const PRODUCT_STATUS: Record<string, { label: string; color: string }> = {
  testing: { label: "🧪 試験中", color: "#fde047" },
  dev: { label: "🔬 開発中", color: "#93c5fd" },
  sale: { label: "✅ 販売中", color: "#86efac" },
};

export default function LabPage() {
  return (
    <main style={{ background: "#080808", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* Hero */}
      <section style={{ paddingTop: 48, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <motion.div {...fade}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.25)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#c9a962", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 28 }}>
            🧪 SOLUNA Lab — 建材研究開発
          </div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.8rem, 7vw, 5rem)", letterSpacing: "0.04em", lineHeight: 1, marginBottom: 24, color: "#fff" }}>
            MATERIALS<br /><span style={{ color: "#c9a962" }}>FROM NATURE</span>
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 40px" }}>
            SOLUNAが開発中の自然素材建材。農業廃棄物・キノコ・竹を使い、環境負荷ゼロの建築材料を目指す研究開発プロジェクト。試験が完了したものから販売を開始します。
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {Object.entries(PRODUCT_STATUS).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: v.color }}>
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Materials */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 120px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {MATERIALS.map((m, i) => (
            <motion.div key={m.id} {...fade} transition={{ duration: 0.7, delay: i * 0.08 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>

                {/* Header */}
                <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 28 }}>{m.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.en}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560 }}>{m.desc}</p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: PRODUCT_STATUS[m.status].color, fontWeight: 600 }}>
                      {PRODUCT_STATUS[m.status].label}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

                  {/* Spec */}
                  <div style={{ padding: "20px 28px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>仕様</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {m.spec.map(s => (
                        <div key={s.k} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{s.k}</span>
                          <span style={{ fontSize: 13, color: "#e2e8f0" }}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tests */}
                  <div style={{ padding: "20px 28px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>性能試験</div>
                    {m.tests.length === 0 ? (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>素材試験完了後に実施予定</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {m.tests.map(t => {
                          const s = STATUS_MAP[t.status] ?? STATUS_MAP.planned;
                          return (
                            <div key={t.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                              <div>
                                <div style={{ fontSize: 12, color: "#e2e8f0" }}>{t.name}</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.org}</div>
                              </div>
                              <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {m.note && (
                      <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10 }}>{m.note}</div>
                    )}
                  </div>

                </div>

                {/* Price / CTA */}
                <div style={{ padding: "16px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    {m.price ?? "価格：試験完了後に決定"}
                  </div>
                  <button
                    disabled
                    style={{ background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.2)", color: "rgba(201,169,98,0.5)", borderRadius: 8, padding: "7px 18px", fontSize: 12, fontWeight: 600, cursor: "not-allowed" }}
                  >
                    購入（準備中）
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Notify CTA */}
        <motion.div {...fade} style={{ marginTop: 60, textAlign: "center" }}>
          <div style={{ background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 16, padding: "40px 32px" }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, letterSpacing: "0.05em", color: "#c9a962", marginBottom: 12 }}>試験結果が出たら通知を受け取る</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.7 }}>
              GBRC・林産試験場での性能試験が完了次第、メールでお知らせします。<br />販売開始前に先行予約も受け付ける予定です。
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 16px", fontSize: 14, color: "#fff", outline: "none", minWidth: 240 }}
              />
              <button
                style={{ background: "#c9a962", color: "#080808", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                onClick={() => alert("Coming soon")}
              >
                通知を受け取る
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer nav */}
        <div style={{ marginTop: 60, textAlign: "center", display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ホーム</Link>
          <Link href="/vision" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>ビジョン</Link>
          <Link href="/community" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>コミュニティ</Link>
        </div>
      </section>

    </main>
  );
}
