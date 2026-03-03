import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { writeFileSync, readFileSync } from "fs";

const KEYPAIR_FILE = "scripts/mainnet-keypair.json";
const RPC = "https://api.mainnet-beta.solana.com";

async function main() {
  console.log("=== ZAMNA NFT Collection Creator (Mainnet) ===\n");

  const connection = new Connection(RPC, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 120000,
  });

  // Load keypair
  const secret = JSON.parse(readFileSync(KEYPAIR_FILE, "utf8"));
  const creator = Keypair.fromSecretKey(Uint8Array.from(secret));
  console.log("Creator:", creator.publicKey.toBase58());

  // Check balance
  const balance = await connection.getBalance(creator.publicKey);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL\n`);

  if (balance < 0.03 * LAMPORTS_PER_SOL) {
    console.log("Insufficient balance. Need at least 0.03 SOL.");
    console.log(`Send SOL to: ${creator.publicKey.toBase58()}`);
    process.exit(1);
  }

  const metaplex = Metaplex.make(connection).use(keypairIdentity(creator));

  // 1. Create Artist Pass Collection
  console.log("Creating ZAMNA Artist Pass collection...");
  const { nft: artistCollection } = await metaplex.nfts().create({
    name: "ZAMNA Artist Pass",
    symbol: "ZART",
    uri: "https://soluna-web.fly.dev/api/metadata/artist-collection",
    sellerFeeBasisPoints: 0,
    isCollection: true,
  });
  console.log("  Address:", artistCollection.address.toBase58());

  // 2. Create VIP Pass Collection
  console.log("Creating ZAMNA VIP Pass collection...");
  const { nft: vipCollection } = await metaplex.nfts().create({
    name: "ZAMNA VIP Pass",
    symbol: "ZVIP",
    uri: "https://soluna-web.fly.dev/api/metadata/vip-collection",
    sellerFeeBasisPoints: 0,
    isCollection: true,
  });
  console.log("  Address:", vipCollection.address.toBase58());

  // Save results
  const output = {
    creator: creator.publicKey.toBase58(),
    artistCollection: artistCollection.address.toBase58(),
    vipCollection: vipCollection.address.toBase58(),
    network: "mainnet-beta",
  };
  writeFileSync("scripts/collections-mainnet.json", JSON.stringify(output, null, 2));

  const remaining = await connection.getBalance(creator.publicKey);

  console.log("\n=== SUCCESS ===");
  console.log("NEXT_PUBLIC_ARTIST_COLLECTION=" + artistCollection.address.toBase58());
  console.log("NEXT_PUBLIC_VIP_COLLECTION=" + vipCollection.address.toBase58());
  console.log(`Remaining balance: ${remaining / LAMPORTS_PER_SOL} SOL`);
  console.log("\nDeploy commands:");
  console.log(`  NEXT_PUBLIC_ARTIST_COLLECTION=${artistCollection.address.toBase58()} NEXT_PUBLIC_VIP_COLLECTION=${vipCollection.address.toBase58()} NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta npm run build`);
  console.log(`  fly deploy -a soluna-web`);
}

main().catch(err => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
