"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";
import { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getEndpoint } from "@/lib/solana";
import Link from "next/link";

type PassType = "artist" | "vip";

export default function MintPage() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const [selectedPass, setSelectedPass] = useState<PassType>("vip");
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!publicKey || !connected) return;
    setMinting(true);
    setError(null);
    setMintResult(null);

    try {
      const connection = new Connection(getEndpoint(), "confirmed");

      // On devnet, we create a simple "proof of concept" mint
      // by sending a small SOL transaction to self with a memo-like approach
      // Real NFT minting would use Metaplex SDK
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 1, // minimal transfer as proof
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setMintResult(signature);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,98,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />

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
        <span style={{ fontSize: 10, color: "rgba(201,169,98,0.7)", letterSpacing: "0.2em" }}>DEVNET</span>
      </nav>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginBottom: 16 }}>
          SOLUNA x SOLANA
        </p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,7vw,3.2rem)", color: "#fff", marginBottom: 12 }}>
          Mint Your Pass
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.6, marginBottom: 40 }}>
          Mint a SOLUNA NFT pass on Solana devnet to access exclusive content. Switch your Phantom wallet to devnet first.
        </p>

        {/* Pass selection */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          {([
            { type: "artist" as PassType, title: "Artist Pass", desc: "Backstage access, rider info, production contacts", color: "rgba(74,222,128," },
            { type: "vip" as PassType, title: "VIP Pass", desc: "Premium viewing, open bar, meet & greet, concierge", color: "rgba(201,169,98," },
          ]).map(pass => (
            <button key={pass.type} onClick={() => setSelectedPass(pass.type)}
              style={{
                padding: "20px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                background: selectedPass === pass.type ? `${pass.color}0.08)` : "rgba(255,255,255,0.02)",
                border: `2px solid ${selectedPass === pass.type ? `${pass.color}0.4)` : "rgba(255,255,255,0.07)"}`,
                transition: "all 0.2s",
              }}>
              <p style={{ color: selectedPass === pass.type ? `${pass.color}0.9)` : "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                {pass.title}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, lineHeight: 1.5 }}>{pass.desc}</p>
            </button>
          ))}
        </div>

        {/* Wallet + Mint */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          {!connected ? (
            <WalletMultiButton style={{
              background: "rgba(201,169,98,0.15)",
              border: "1px solid rgba(201,169,98,0.4)",
              borderRadius: 999,
              color: "rgba(201,169,98,0.9)",
              fontWeight: 700,
              fontSize: 14,
              padding: "16px 36px",
              width: "100%",
              justifyContent: "center",
            }} />
          ) : (
            <>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-6)}
              </p>
              <button onClick={handleMint} disabled={minting}
                style={{
                  width: "100%", padding: "16px 0", borderRadius: 999, cursor: minting ? "wait" : "pointer",
                  background: minting ? "rgba(201,169,98,0.3)" : "rgba(201,169,98,0.85)",
                  border: "none", color: "#000", fontWeight: 700, fontSize: 14,
                  letterSpacing: "0.08em", transition: "background 0.2s",
                }}>
                {minting ? "Minting..." : `Mint ${selectedPass === "artist" ? "Artist" : "VIP"} Pass (Devnet)`}
              </button>
            </>
          )}

          {mintResult && (
            <div style={{ width: "100%", padding: "16px 20px", borderRadius: 12, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <p style={{ color: "rgba(74,222,128,0.9)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Mint Successful!
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, wordBreak: "break-all" }}>
                TX: {mintResult}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Link href={selectedPass === "artist" ? "/artist-lounge" : "/vip-lounge"} style={{
                  padding: "8px 18px", borderRadius: 999, fontSize: 12,
                  background: "rgba(201,169,98,0.15)", border: "1px solid rgba(201,169,98,0.3)",
                  color: "rgba(201,169,98,0.9)", textDecoration: "none", fontWeight: 600,
                }}>
                  Enter {selectedPass === "artist" ? "Artist" : "VIP"} Lounge
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div style={{ width: "100%", padding: "14px 20px", borderRadius: 12, background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,80,80,0.2)" }}>
              <p style={{ color: "rgba(255,80,80,0.9)", fontSize: 13 }}>{error}</p>
            </div>
          )}
        </div>

        <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, textAlign: "center", marginTop: 40, lineHeight: 1.6 }}>
          This is a devnet demo. NFTs minted here have no real value.
          <br />Switch Phantom to Devnet: Settings → Developer Settings → Change Network
        </p>
      </div>
    </div>
  );
}
