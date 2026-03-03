import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { writeFileSync, readFileSync, existsSync } from "fs";

const KEYPAIR_FILE = "scripts/creator-keypair.json";

async function main() {
  console.log("=== ZAMNA NFT Collection Creator (Devnet) ===\n");

  const connection = new Connection(clusterApiUrl("devnet"), {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 120000,
  });

  // Load or create keypair
  let creator;
  if (existsSync(KEYPAIR_FILE)) {
    const saved = JSON.parse(readFileSync(KEYPAIR_FILE, "utf8"));
    creator = Keypair.fromSecretKey(Uint8Array.from(saved));
    console.log("Loaded existing keypair:", creator.publicKey.toBase58());
  } else {
    creator = Keypair.generate();
    writeFileSync(KEYPAIR_FILE, JSON.stringify(Array.from(creator.secretKey)));
    console.log("Generated new keypair:", creator.publicKey.toBase58());
    console.log(`Saved to ${KEYPAIR_FILE}`);
  }

  // Check balance
  const balance = await connection.getBalance(creator.publicKey);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    // Try airdrop
    console.log("\nAttempting airdrop...");
    try {
      const sig = await connection.requestAirdrop(creator.publicKey, 2 * LAMPORTS_PER_SOL);
      console.log("Airdrop requested, confirming...");
      await connection.confirmTransaction(sig, "confirmed");
      const newBalance = await connection.getBalance(creator.publicKey);
      console.log(`New balance: ${newBalance / LAMPORTS_PER_SOL} SOL\n`);
    } catch (err) {
      console.log(`Airdrop failed: ${err.message}\n`);
      console.log("=== MANUAL FUNDING REQUIRED ===");
      console.log(`1. Go to https://faucet.solana.com`);
      console.log(`2. Select "devnet"`);
      console.log(`3. Paste this address: ${creator.publicKey.toBase58()}`);
      console.log(`4. Request at least 2 SOL`);
      console.log(`5. Re-run: node scripts/create-collections.mjs`);
      console.log("");
      console.log(`Or use Solana CLI:`);
      console.log(`  solana airdrop 2 ${creator.publicKey.toBase58()} --url devnet`);
      process.exit(0);
    }
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

  // 3. Mint test Artist Pass
  console.log("\nMinting test Artist Pass NFT...");
  const { nft: testArtist } = await metaplex.nfts().create({
    name: "ZAMNA Artist Pass #1",
    symbol: "ZART",
    uri: "https://soluna-web.fly.dev/api/metadata/artist-pass",
    sellerFeeBasisPoints: 0,
    collection: artistCollection.address,
  });
  await metaplex.nfts().verifyCollection({
    mintAddress: testArtist.address,
    collectionMintAddress: artistCollection.address,
  });
  console.log("  Mint:", testArtist.mint.address.toBase58(), "(verified)");

  // 4. Mint test VIP Pass
  console.log("Minting test VIP Pass NFT...");
  const { nft: testVip } = await metaplex.nfts().create({
    name: "ZAMNA VIP Pass #1",
    symbol: "ZVIP",
    uri: "https://soluna-web.fly.dev/api/metadata/vip-pass",
    sellerFeeBasisPoints: 0,
    collection: vipCollection.address,
  });
  await metaplex.nfts().verifyCollection({
    mintAddress: testVip.address,
    collectionMintAddress: vipCollection.address,
  });
  console.log("  Mint:", testVip.mint.address.toBase58(), "(verified)");

  // Save results
  const output = {
    creator: creator.publicKey.toBase58(),
    artistCollection: artistCollection.address.toBase58(),
    vipCollection: vipCollection.address.toBase58(),
    testArtistPass: testArtist.mint.address.toBase58(),
    testVipPass: testVip.mint.address.toBase58(),
    network: "devnet",
  };
  writeFileSync("scripts/collections.json", JSON.stringify(output, null, 2));

  console.log("\n=== SUCCESS ===");
  console.log("NEXT_PUBLIC_ARTIST_COLLECTION=" + artistCollection.address.toBase58());
  console.log("NEXT_PUBLIC_VIP_COLLECTION=" + vipCollection.address.toBase58());
  console.log("\nSaved to scripts/collections.json");
  console.log("\nSet Fly.io secrets:");
  console.log(`  fly secrets set NEXT_PUBLIC_ARTIST_COLLECTION=${artistCollection.address.toBase58()} NEXT_PUBLIC_VIP_COLLECTION=${vipCollection.address.toBase58()} NEXT_PUBLIC_SOLANA_NETWORK=devnet -a soluna-web`);
}

main().catch(err => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
