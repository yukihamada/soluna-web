"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect, type ReactNode } from "react";
import { checkNFTOwnership } from "@/lib/solana";

type Props = {
  collectionAddress: string;
  passName: string;
  children: ReactNode;
};

export default function WalletGate({ collectionAddress, passName, children }: Props) {
  const { publicKey, connected } = useWallet();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey || !collectionAddress) {
      setHasAccess(false);
      setChecked(false);
      return;
    }

    setChecking(true);
    checkNFTOwnership(publicKey.toBase58(), collectionAddress)
      .then(result => {
        setHasAccess(result);
        setChecked(true);
      })
      .catch(() => {
        setHasAccess(false);
        setChecked(true);
      })
      .finally(() => setChecking(false));
  }, [connected, publicKey, collectionAddress]);

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,98,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />

      {!connected ? (
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 16 }}>
            SOLUNA x SOLANA
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,6vw,3rem)", color: "#fff", marginBottom: 12 }}>
            {passName}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32, maxWidth: 400 }}>
            Connect your Phantom wallet to verify your NFT pass and access exclusive content.
          </p>
          <WalletMultiButton style={{
            background: "rgba(201,169,98,0.15)",
            border: "1px solid rgba(201,169,98,0.4)",
            borderRadius: 999,
            color: "rgba(201,169,98,0.9)",
            fontWeight: 700,
            fontSize: 13,
            padding: "14px 32px",
            letterSpacing: "0.08em",
          }} />
        </div>
      ) : checking ? (
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(201,169,98,0.3)", borderTopColor: "rgba(201,169,98,0.9)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Verifying NFT ownership...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : checked && !hasAccess ? (
        <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 440 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", marginBottom: 12 }}>
            Access Required
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            You need a <strong style={{ color: "rgba(201,169,98,0.9)" }}>{passName}</strong> NFT to access this page.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <a href="/mint" style={{
              display: "inline-block", padding: "14px 28px", borderRadius: 999,
              background: "rgba(201,169,98,0.85)", color: "#000", fontWeight: 700,
              fontSize: 13, letterSpacing: "0.08em", textDecoration: "none", textAlign: "center",
            }}>
              Mint NFT Pass
            </a>
            <WalletMultiButton style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 999,
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              padding: "10px 24px",
            }} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 16 }}>
            Wallet: {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
          </p>
        </div>
      ) : (
        <div style={{ width: "100%" }}>{children}</div>
      )}
    </div>
  );
}
