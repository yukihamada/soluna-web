import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export function getEndpoint(): string {
  if (SOLANA_NETWORK === "mainnet-beta") {
    return "https://api.mainnet-beta.solana.com";
  }
  return "https://api.devnet.solana.com";
}

export async function checkNFTOwnership(
  walletAddress: string,
  collectionAddress: string
): Promise<boolean> {
  try {
    const connection = new Connection(getEndpoint(), "confirmed");
    const owner = new PublicKey(walletAddress);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });

    for (const account of tokenAccounts.value) {
      const parsed = account.account.data.parsed;
      const info = parsed?.info;
      if (!info) continue;

      const amount = info.tokenAmount?.uiAmount;
      if (amount !== 1) continue;

      const mint = info.mint;
      if (!mint) continue;

      // Check if this NFT belongs to the target collection via metadata
      // Using Metaplex token metadata program
      const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
      const mintPubkey = new PublicKey(mint);

      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );

      try {
        const metadataAccount = await connection.getAccountInfo(metadataAddress);
        if (!metadataAccount?.data) continue;

        // Parse metadata to check collection
        // Collection field is at a variable offset in the metadata struct
        // For simplicity, check if the collection address bytes appear in the data
        const collectionPubkey = new PublicKey(collectionAddress);
        const collectionBytes = collectionPubkey.toBytes();
        const data = metadataAccount.data;

        for (let i = 0; i <= data.length - 32; i++) {
          let match = true;
          for (let j = 0; j < 32; j++) {
            if (data[i + j] !== collectionBytes[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            // Check the verified flag (byte after the 32-byte collection address + 1 byte for option flag)
            // In Metaplex metadata, collection is: Option<Collection> = { verified: bool, key: Pubkey }
            // The key match is found, and we check the verified byte preceding it
            if (i > 0 && data[i - 1] === 1) {
              return true;
            }
            // Also accept unverified for devnet testing
            if (SOLANA_NETWORK === "devnet") {
              return true;
            }
          }
        }
      } catch {
        continue;
      }
    }

    return false;
  } catch (err) {
    console.error("NFT ownership check failed:", err);
    return false;
  }
}
